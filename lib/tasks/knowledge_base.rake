# Knowledge-base tooling.
#
# `vocabulary.md` is a GENERATED, always-loaded index of the domain lexicon. It
# is a pure view over the `knowledge-base/` tree: every file with `lexicon: true`
# in its frontmatter contributes one entry (its `term` + `definition`). Never edit
# vocabulary.md by hand — change the source file's frontmatter and regenerate.
#
#   rake kb:vocabulary        # (re)write knowledge-base/vocabulary.md
#   rake kb:vocabulary:check  # verify it's current (nonzero exit if stale)
#
# No Rails dependency (no :environment) so it runs fast in a pre-commit hook.

require "yaml"
require "date"

namespace :kb do
  KB_ROOT = File.expand_path("../../knowledge-base", __dir__)
  VOCAB_PATH = File.join(KB_ROOT, "vocabulary.md")

  # Parse leading YAML frontmatter from a file's text. Returns a Hash, or nil if
  # there is no frontmatter or it doesn't parse. Shared by the lexicon and index
  # generators so both read frontmatter the same way.
  def kb_frontmatter(text)
    return nil unless text.start_with?("---")
    fm_end = text.index("\n---", 3)
    return nil unless fm_end
    fm = begin
      YAML.safe_load(text[4...fm_end], permitted_classes: [Date, Time])
    rescue StandardError
      nil
    end
    fm.is_a?(Hash) ? fm : nil
  end

  def kb_lexicon_entries
    entries = []
    Dir.glob(File.join(KB_ROOT, "**", "*.md")).sort.each do |path|
      next if File.basename(path) == "vocabulary.md"
      fm = kb_frontmatter(File.read(path))
      next unless fm && fm["lexicon"] == true

      entries << {
        term: (fm["term"] || File.basename(path, ".md")).to_s,
        definition: fm["definition"].to_s.strip,
        rel: path.sub("#{KB_ROOT}/", ""),
        status: fm["status"],
        group: fm["lexicon_group"],
      }
    end
    entries
  end

  def kb_render(entries)
    dead = ->(e) { %w[dead partial].include?(e[:status]) }
    core = entries.reject { |e| dead.call(e) || e[:group] == "chat" }
    chat = entries.select { |e| e[:group] == "chat" && !dead.call(e) }
    deadp = entries.select { |e| dead.call(e) }

    out = +"# Everycent Vocabulary\n\n"
    out << "> Generated from `knowledge-base/` frontmatter by `rake kb:vocabulary`. " \
           "Do not edit by hand — change the source file's `definition` and regenerate.\n\n"
    out << "Domain words with compressed definitions, loaded at session start. Follow the " \
           "link for full context, mechanics, history, and gotchas in the knowledge base.\n\n"

    render = lambda do |title, list|
      return if list.empty?
      out << "\n## #{title}\n\n" if title
      list.sort_by { |e| e[:term] }.each do |e|
        status = e[:status] ? " _(#{e[:status]})_" : ""
        out << "**#{e[:term]}**#{status} — #{e[:definition]} · [#{e[:rel]}](#{e[:rel]})\n\n"
      end
    end

    render.call(nil, core)        # core words sit at the top, no header
    render.call("NLQ chat", chat)
    render.call("Dead / partial", deadp)
    "#{out.rstrip}\n"
  end

  desc "Generate knowledge-base/vocabulary.md from lexicon frontmatter"
  task :vocabulary do
    entries = kb_lexicon_entries
    File.write(VOCAB_PATH, kb_render(entries))
    puts "Wrote #{VOCAB_PATH} (#{entries.size} entries)"
  end

  namespace :vocabulary do
    desc "Verify vocabulary.md is up to date (nonzero exit if stale)"
    task :check do
      expected = kb_render(kb_lexicon_entries)
      actual = File.exist?(VOCAB_PATH) ? File.read(VOCAB_PATH) : ""
      if expected == actual
        puts "vocabulary.md is up to date"
      else
        warn "vocabulary.md is STALE — run `rake kb:vocabulary`"
        exit 1
      end
    end
  end

  # --- Per-directory index.md generation -------------------------------------
  #
  # Each immediate subdirectory of KB_ROOT holding 3+ concept files gets a
  # generated, frontmatter-less `index.md` listing (OKF progressive disclosure).
  # Smaller directories (e.g. legacy/, single file) are left without one. Each
  # entry's text is the source file's `description` — single-sourced, so the
  # listing can't drift. Like vocabulary.md, these are GENERATED: never edit by
  # hand; change the source `description` and run `rake kb:index`.

  # Subdirectories that qualify for an index.md (3+ non-index .md files), sorted.
  def kb_index_dirs
    Dir.glob(File.join(KB_ROOT, "*")).select { |p| File.directory?(p) }.sort.select do |dir|
      Dir.glob(File.join(dir, "*.md")).count { |p| File.basename(p) != "index.md" } >= 3
    end
  end

  # Listing entries for one directory, sorted by title.
  def kb_index_entries(dir)
    Dir.glob(File.join(dir, "*.md")).sort.filter_map do |path|
      next if File.basename(path) == "index.md"
      fm = kb_frontmatter(File.read(path)) || {}
      title = (fm["title"] || File.basename(path, ".md")).to_s
      desc = fm["description"].to_s.strip
      desc = fm["definition"].to_s.strip if desc.empty? # fall back to the lexicon definition
      status = fm["status"] || (fm["doc_status"] == "stub" ? "stub" : nil)
      {
        title: title,
        desc: desc.gsub(/\s+/, " "),
        file: File.basename(path),
        status: status,
        dead: %w[dead deprecated partial].include?(fm["status"].to_s),
      }
    end.sort_by { |e| e[:title].downcase }
  end

  def kb_index_render(dir)
    entries = kb_index_entries(dir)
    heading = File.basename(dir).capitalize
    live = entries.reject { |e| e[:dead] }
    dead = entries.select { |e| e[:dead] }

    out = +"# #{heading}\n\n"
    out << "> Generated by `rake kb:index` — do not edit by hand; change the source " \
           "file's `description` and regenerate.\n\n"

    line = lambda do |e|
      tag = e[:status] ? " _(#{e[:status]})_" : ""
      "* [#{e[:title]}](#{e[:file]})#{tag} - #{e[:desc]}\n"
    end

    live.each { |e| out << line.call(e) }
    unless dead.empty?
      out << "\n## Dead / partial\n\n"
      dead.each { |e| out << line.call(e) }
    end
    "#{out.rstrip}\n"
  end

  desc "Generate each multi-file subdirectory's index.md from frontmatter descriptions"
  task :index do
    kb_index_dirs.each do |dir|
      path = File.join(dir, "index.md")
      File.write(path, kb_index_render(dir))
      puts "Wrote #{path.sub("#{KB_ROOT}/", "")} (#{kb_index_entries(dir).size} entries)"
    end
  end

  namespace :index do
    desc "Verify every generated index.md is up to date (nonzero exit if stale)"
    task :check do
      stale = kb_index_dirs.reject do |dir|
        path = File.join(dir, "index.md")
        File.exist?(path) && File.read(path) == kb_index_render(dir)
      end
      if stale.empty?
        puts "index.md files are up to date"
      else
        rels = stale.map { |d| "#{File.basename(d)}/index.md" }.join(", ")
        warn "STALE index.md (#{rels}) — run `rake kb:index`"
        exit 1
      end
    end
  end
end

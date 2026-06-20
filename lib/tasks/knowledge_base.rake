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

  def kb_lexicon_entries
    entries = []
    Dir.glob(File.join(KB_ROOT, "**", "*.md")).sort.each do |path|
      next if File.basename(path) == "vocabulary.md"
      text = File.read(path)
      next unless text.start_with?("---")
      fm_end = text.index("\n---", 3)
      next unless fm_end
      fm = begin
        YAML.safe_load(text[4...fm_end], permitted_classes: [Date, Time])
      rescue StandardError
        nil
      end
      next unless fm.is_a?(Hash) && fm["lexicon"] == true

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
end

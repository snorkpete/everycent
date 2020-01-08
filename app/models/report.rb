class Report

  def self.generate_report(sql, fields)
    data = ActiveRecord::Base.connection.select_all(sql)
    {
        success: true,
        data: data,
        fields: fields
    }
  end


  def self.net_worth(household)
    sql = "
   with data as (
        select to_char(b.start_date, 'yyyy-mm') as period, sum((deposit_amount - withdrawal_amount)) as net
        from transactions t
                 inner join budgets b
                            on t.transaction_date between b.start_date and b.end_date and b.household_id = t.household_id
        where t.household_id = #{household.id}
        group by to_char(b.start_date, 'yyyy-mm')
        order by to_char(b.start_date, 'yyyy-mm')
    )

    select
          period,
           net as net_change,
          sum(net) over (order by period asc rows between unbounded preceding and current row) as net_worth
    from data"

    generate_report(sql, %w(period net_change net_worth))
  end

  def self.category_spending(household)
    sql = "
    with data as (
        select period, category_name, allocation_name, budgeted, spent, budgeted - spent as diff
        from (
             select to_char(b.end_date, 'yyyy-mm') as period,
                    c.name                         as category_name,
                    a.name                         as allocation_name,
                    a.amount                       as budgeted,
                    coalesce((select sum(withdrawal_amount - deposit_amount)
                              from transactions t
                              where t.allocation_id = a.id
                             ), 0)                   as spent
             from allocations a
                      inner join budgets b on a.budget_id = b.id
                      inner join allocation_categories c on c.id = a.allocation_category_id
             where a.household_id = #{household.id}
         ) as results
    )

    select period, category_name, sum(budgeted) as budgeted, sum(spent) as spent, sum(diff) as diff
    from data
    group by period, category_name
        order by category_name, period
    "
    generate_report(sql,
                    [
                        { name: 'period', label: 'Period', numeric: false},
                        { name: 'budgeted', label: 'Budgeted', numeric: true},
                        { name: 'spent', label: 'Spent', numeric: true},
                        { name: 'diff', label: 'Difference', numeric: true}
                    ])
  end

  def self.needs_vs_wants(household)
    sql = "
      with data as (
          select to_char(b.end_date, 'yyyy-mm')                                   as period,
                 (select sum(amount) from incomes where budget_id = b.id) / 100.0 as income,
                 coalesce((select sum(amount) from allocations where budget_id = b.id and allocation_class = 'need'), 0) /
                 100.0                                                            as budgeted_needs,
                 coalesce((select sum(withdrawal_amount - deposit_amount)
                           from transactions
                           where allocation_id in
                                 (select id from allocations where budget_id = b.id and allocation_class = 'need')), 0) /
                 100.0                                                            as actual_needs,
                 coalesce((select sum(amount) from allocations where budget_id = b.id and allocation_class = 'savings'), 0) /
                 100.0                                                            as budgeted_savings,
                 coalesce((select sum(withdrawal_amount - deposit_amount)
                           from transactions
                           where allocation_id in
                                 (select id from allocations where budget_id = b.id and allocation_class = 'savings')), 0) /
                 100.0                                                            as actual_savings
          from budgets b
          where b.household_id = 96
      --         where b.household_id = 879
      )
      select period,
             budgeted_needs,
             actual_needs,
             income - budgeted_needs - budgeted_savings as budgeted_wants,
             income - actual_needs - actual_savings as actual_wants,
             budgeted_savings,
             actual_savings,
             round(budgeted_needs / income  * 100) as budgeted_needs_pct,
             round((income - budgeted_needs - budgeted_savings) / income  * 100) as budgeted_wants_pct,
             round(budgeted_savings / income  * 100) as budgeted_savings_pct,
             round(actual_needs / income  * 100) as actual_needs_pct,
             round((income - actual_needs - actual_savings) / income  * 100) as actual_wants_pct,
             round(actual_savings / income  * 100) as actual_savings_pct
      from data
      order by period
    "
    generate_report(sql,
                    [
                        { name: 'period', label: 'Period', numeric: false, class: 'all'},
                        { name: 'budgeted_needs', label: 'Budgeted Needs', numeric: true},
                        { name: 'actual_needs', label: 'Actual Needs', numeric: true},
                        { name: 'budgeted_wants', label: 'Budgeted Wants', numeric: true},
                        { name: 'actual_wants', label: 'Actual Wants', numeric: true},
                        { name: 'budgeted_savings', label: 'Budgeted Savings', numeric: true},
                        { name: 'actual_savings', label: 'Actual Savings', numeric: true},
                        { name: 'budgeted_needs_pct', label: 'Budgeted Needs %', numeric: false, class: 'budgeted'},
                        { name: 'budgeted_wants_pct', label: 'Budgeted Wants %', numeric: false, class: 'budgeted'},
                        { name: 'budgeted_savings_pct', label: 'Budgeted Savings %', numeric: false, class: 'budgeted'},
                        { name: 'actual_needs_pct', label: 'Actual Needs %', numeric: false, class: 'actual'},
                        { name: 'actual_wants_pct', label: 'Actual Wants %', numeric: false, class: 'actual'},
                        { name: 'actual_savings_pct', label: 'Actual Savings %', numeric: false, class: 'actual'},
                    ])
  end
end

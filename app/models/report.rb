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
end

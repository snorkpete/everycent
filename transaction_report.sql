
select allocation_categories.name as Category, allocations.name as Allocation,
       to_char(transaction_date, 'Mon, yyyy') as Month, sum(withdrawal_amount - deposit_amount) / 100.0 as spent,
       to_char(transaction_date, 'yyyy-mm') as date_order
     from transactions
     inner join allocations on allocations.id = transactions.allocation_id
     inner join allocation_categories on allocation_categories.id = allocations.allocation_category_id
where transactions.household_id = 96
group by allocation_categories.name, allocations.name, to_char(transaction_date, 'Mon, yyyy'), to_char(transaction_date, 'yyyy-mm')
order by allocation_categories.name, allocations.name, to_char(transaction_date, 'yyyy-mm')
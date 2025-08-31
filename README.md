Everycent - a Zero Based Budget Manager
=======================================

Everycent is a simple zero-based budgeting tool based around the concept that you give every cent a job. 

You construct a budget that outlines your income for the month, and create allocations to represent how that income is going to be allocated throughout the month (expenses like food and rent, or savings, debt repayment or whatever).

During the month, transactions can be imported from your bank and then allocated against the various expense allocations, showing where your money is being used through the month. On the main budget screen, those expense allocations are summarised per allocation to show you how much you have remaining to use in any given allocation.

At the end of the month, you can copy your budget to create a new budget for the next month, adjust whatever allocations need adjusting for that new month and start again. 

As part of the configuration, you designate one of your accounts as your primary budgeting account, and Everycent provides a helpful summary to help reconcile your budget balances with the account balance in that budgeting account to ensure that you're properly allocating the necessary transactions to the proper budgeting category.

### Main Features ###

## Bank Accounts ##
* add your various bank accounts to be tracked

## Budgets ##
* create and manage your budget here
* each budget is for a one month period
* the last budget can easily be copied over to create the budget for the new month
* 

## Transactions ##
* all transactions for each of your accounts can be entered quickly and easily
* there is a helpful transaction import function that uses a simple but effective 'copy-paste' solution to import your transactions (The import was built to work with Scotia Bank's web interface, but more banks can be added as needed)
* there's a helpful transaction summary to ensure that the info in Everycent reconciles with your bank account information on your bank's website

## Credit Cards ##
One particularly tricky issue when dealing with credit cards is how to track the spending properly, since when you buy something with a credit card, it's actually not paid for until some time after. Everycent has a concept of 'paid' vs 'unpaid' transactions. Transactions against credit card accounts are defaulted as 'unpaid' transactions. Therefore, when you make a purchase with a credit card, you can put an allocation towards that transaction at the time of the purchase. This transaction will default as 'unpaid', but when you view your budget, the money spent against that allocation will include these 'unpaid' transactions. 

Later on, when you make a payment on your credit card to pay off the outstanding balance, you can go back and mark the previous transactions as 'paid' to indicate that they have been handled. When viewing credit card transaction data, there's a helpful 'unpaid' total to show you what money you have already spent but not paid for to ensure that you're tracking your spending properly. 

## Sink Funds ##
In Dave Ramsey terminology, a sink fund is simply a category of money that is being built up to be used for a specific purpose. Everycent allows any account to be marked as a sink fund account. At this point, the money in the account can be allocated for each purpose and expenses against this purpose tracked separately even though the funds are actually in the same bank account.


### History ###
Everycent was developed after my wife and I started listening to Dave Ramsey and realised we needed to get our finances in order. We changed how we handled our finances and moved to using one shared account for all household spending, and keeping our personal accounts only for our own personal discretionary expenses. Everything else is allocated in the budget and tracked against those budget allocations so we can see how our household spending goes through the month.

### Preparing a Release ###
Although the backend API for this app is a Rails app, the UI is built using Angular and does not use the asset pipeline.
As a result, the frontend static assets must be prepared separately.

This is done by:
  * first ensuring you have a clean working directory (i.e. all changes committed)
  * then, running `ng run build` in the `webclientv3` folder to create the static assets in `/public`
  * then building the v1 assets by running `gulp` in the `webclient` folder
  * copy `webclient/index.html` and `webclient/fonts` to `public/v1`
  * then, and then committing the build result using `git add . && git commit -m "build of static assets"`
  
  Note that if you're unable to run gulp, you can just checkout the previously built v1 assets
  
   `git checkout -- public/v1`
   
The order of the steps is important because the Angular build clears out the v1 static assets,
so they have to be re-added after. Note that the v1 assets will soon be removed permanently,
but they are being left in place just in case.

### PG Installation Issues

Getting the `pg` gem up and running on a new machine, or with a different version of Postgres is a pain in the ass.
Assuming you're using the Postgres.app for an easy installation of Postgres, then you have to ensure that you compile the pg gem
against that version of Postgres.

So, let's say you're running version 10 of Postgres through Postgres.app.

To install the `pg` gem,

````
gem install pg -v '0.21.0' -- --with-pg-config=/Applications/Postgres.app/Contents/Versions/10/bin/pg_config

````

Of course, nothing is ever so simple. The `spring` preloader that comes with rails can give you some grief,
so make sure you kill it first, before attempting the above.


We'll have to go through the same song and dance above when we change Postgres versions.
 



### Special Events TODO
* add a link to transactions from the special event
* remove allocation amount (useless)
* default the budget filter to current budget
* default the category filter to default_special_event_category_id
* add a setting for default special category
* add a date to special events 
* sort the list of special events


### TO FIX:  
* the heading is not updating when calling `toolbarService.updateHeading` - value is updated in service but not in component
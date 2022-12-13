* This is not so simple as it looks.
* Yes definitely, you can buy, but you always have to pay 100 or more.
* But the price is checked two times, this means if somehow we can give give two different results here, the objective can be reached.
* We need to keep a state which tells us that the function is executed and that we are executing it the 2nd time.
* For this we need mutex or some kind of record as state variable.
* But as the function price is `view` we cannot do any state change from inside of the function which is what is making the attack to faild.
* Just find some other allternative to know that the function has executed once.
    * luckilye we have a sold state variable, which keeps record if the product is sold or not.
    * this state change is squezed between the 2 price calls, this is what makes the attack possible.
    * if product is not bought then it is 1st time, if product is bought then the price is called 2nd time.

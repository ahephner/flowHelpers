public class flowHelpers {
	@InvocableMethod
    public static list<Sales_Goal__c> updateGoals(List<list<Sales_Goal__c>> goals){
       list<Sales_Goal__c> one = goals[0];
       Map<Id, Decimal> combined = new Map<Id, Decimal>(); 
       list<Sales_Rep__c> reps = [select id from Sales_Rep__c where Active__c = true ]; 
		
        for(Sales_Rep__c x:reps){
            decimal amount = 0.00;
            combined.put(x.Id, amount);
        }
        system.debug(combined); 
        for(Sales_Goal__c y:one){
            //system.debug(combined.get(y.Sales_Rep__c));
            system.debug(combined); 
        }
        return null; 
    }
   // public class MethodOutputs{
      //  @InvocableVariable
        //public List<Sales_Goal__c> goalList; 
    //}
     @AuraEnabled(cacheable = true)
    public static list<CartItem> getCartItems(string cId){
        list<CartItem> cartItems = [select id, name, SalesPrice, Product2.Product_Cost__c, Product2.Agency_Pricing__c 
                                   from CartItem
                                   where CartId =:cId];
        return cartItems; 
    }
}
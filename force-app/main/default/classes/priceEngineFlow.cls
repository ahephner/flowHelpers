public class priceEngineFlow {

    public class engineVars {
    	@invocableVariable(label='PricebookEntry')
        @AuraEnabled public List<PricebookEntry> listpbe;
 
    	@InvocableVariable(label='Triggering Product' required=true)
    	@AuraEnabled public Product2 product;
        
        @InvocableVariable(label='Current Date From Flow' required=true)
    	@AuraEnabled public Date currentDate;
	}
    @InvocableMethod
    public static list<list<PricebookEntry>> CheckValues(List<engineVars> engineVars) {
        list<PricebookEntry> back = new list <PriceBookEntry>(); 
        
        //need to loop through and update
        //Held_Margin_Product_Cost__c,
        //Hold_Rounded_Margin__c,
        //Hold_Margin__c
        //Last_Price_Change_Date__c
        //Last_List_Price__c
        //list price = Record.Product_Cost__c/(1-{!vListMargin}/100)
        enginevars el = engineVars[0]; 
        double cost = el.product.Product_Cost__c; 
        system.debug(el.currentDate);
        system.debug(el.listpbe.size()); 
        for(Integer i = 0; i<el.listpbe.size(); i++){
            el.listpbe[i].Held_Margin_Product_Cost__c = cost;
            el.listpbe[i].Last_Price_Change_Date__c = el.currentDate; 
            el.listpbe[i].Last_List_Price__c = el.listpbe[i].UnitPrice;
            el.listpbe[i].UnitPrice = cost/(1-(el.listpbe[i].List_Margin__c/100));
            system.debug(el.listpbe[i].UnitPrice);
            back.add(el.listpbe[i]); 
        }
        List<List<PricebookEntry>> res = new List<List<PricebookEntry>>(); 
        res.add(back);    
        return res; 
    }
}


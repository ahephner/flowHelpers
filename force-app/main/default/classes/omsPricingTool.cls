public class omsPricingTool {
    @AuraEnabled
    public static string pricebookFound(string pbId, list<CartItem> prods, string pbName){
        string messBack;
        string newName = pbName; 
      
        map<id, CartItem> product = new map<id, CartItem>();
        list<pricebookentry> toUpsert = new list<pricebookentry>(); 
        try{
            for(CartItem x:prods){
                product.put(x.Product2Id, x); 
            }
       
            for(pricebookentry a:[select id, UnitPrice,Hold_Margin__c, Product2Id from pricebookentry
                                  where Product2Id in: product.keySet() and Pricebook2Id =:pbId]){
                      				  a.Hold_Margin__c = product.get(a.Product2Id).Hold_Margin__c; 
                                      system.debug('SP '+product.get(a.Product2Id).SalesPrice);
                                      a.UnitPrice = product.get(a.Product2Id).SalesPrice;
                                      toUpsert.add(a);
                                      product.remove(a.Product2Id); 
                                  }
            //check if any new products
            if(product.size()>0){
                for(Id y:product.keySet()){
                    pricebookentry np = new pricebookentry();
                    np.Product2Id = product.get(y).Product2Id;
                    np.UnitPrice = product.get(y).SalesPrice;
                    np.Hold_Margin__c = product.get(y).Hold_Margin__c; 
                    np.Pricebook2Id = pbId; 
                    np.IsActive = true; 
                    toUpsert.add(np); 
                }
                 
            }
            upsert toUpsert;
            if(!String.isBlank(newName)){
                 list<Pricebook2> pb = [select id, name from Pricebook2 where id =: pbId];
                pb[0].Name = newName; 
                update pb; 
            }
            messBack= 'success';
        }catch(exception e){
            messBack = String.valueOf(e);
        }
        return messBack; 
    }
    //Need to check if they are a member of the web store. If not add them
    @AuraEnabled
    public static string createAllTheThings(string accountId, list<CartItem> products, string whoWillOwn){
        string messBack;
        list<PricebookEntry> pbeList = new list<PricebookEntry>();
        id storeId = [select id from webstore where name = 'ATS B2B Store'].id; 
        try{
         //get account details
         list<account> acc=[select id, name from account where id =: accountId ]; 
        //create price book Account_Based__c=true, Priority_Price_Book__c=true
        Pricebook2 pb = new Pricebook2(name=acc[0].Name, isActive=true,  Account_Based_Price_Book__c=true, Owner__c = whoWillOwn);
            insert pb; 
        //create price book entries
            for(CartItem x:products){
                PricebookEntry pbe = new PricebookEntry();
                pbe.Product2Id = x.Product2Id;
                pbe.UnitPrice = x.SalesPrice;
                pbe.Hold_Margin__c = x.Hold_Margin__c; 
                pbe.Pricebook2Id = pb.Id;
                pbe.IsActive = true;
                pbeList.add(pbe);
            }
            insert pbeList; 
        //create buyer group
        BuyerGroup bg = new BuyerGroup(Name = acc[0].Name);  
        insert bg; 
        //create buyer group member
        BuyerGroupMember bgm = new BuyerGroupMember(BuyerId=acc[0].id, BuyerGroupId = bg.Id );
            insert bgm; 
        //create buyer group price book set priority here
        BuyerGroupPricebook bgmpb = new BuyerGroupPricebook(IsActive=true, BuyerGroupId = bg.Id, Pricebook2Id = pb.Id, priority = 2 );
            insert bgmpb; 
        //create webstore access
        WebStoreBuyerGroup webStore = new WebStoreBuyerGroup(BuyerGroupId=bg.Id, webStoreId = storeId);
            insert webStore; 
        messBack = 'New Price Book Created';
        }catch(exception e){
            messBack = string.valueOf(e);
        }

        return messBack;
    }
    
        public with sharing class cartWrapper {
        @AuraEnabled
        public list<cartItem> items {get; set;}
        @AuraEnabled 
        public list<pricebookentry> priceentries {get; set;}
        
    }
         @AuraEnabled(cacheable = true)
    public static cartWrapper getCartItems(string cId, list<string> priceBookIds){
        cartWrapper cw = new cartWrapper(); 
        list<pricebookentry> pricebookEntries = new list<pricebookentry>();
        list<CartItem> cartItems = [select id, Product2Id, name, SalesPrice, Product2.Product_Cost__c, Product2.Agency_Pricing__c, Cart.AccountId,
                                    Product2.Floor_Price__c
                                   from CartItem
                                   where CartId =:cId];
        for(cartItem x:cartItems){
            list<pricebookentry> pbe = getPriceBooks.priorityBestPrice(priceBookIds, x.Product2Id);
            pricebookEntries.add(pbe[0]);
        }
        cw.items = cartItems; 
        cw.priceentries = pricebookEntries; 
        return cw; 
    }
}
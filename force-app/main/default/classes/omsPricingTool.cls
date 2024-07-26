public class omsPricingTool {
    public static string pricebookFound(string pbId, list<CartItem> prods){
        string messBack;
        map<id, CartItem> product = new map<id, CartItem>();
        list<pricebookentry> toUpsert = new list<pricebookentry>(); 
        try{
            for(CartItem x:prods){
                product.put(x.Product2Id, x); 
            }
            
            for(pricebookentry a:[select id, UnitPrice, Product2Id from pricebookentry
                                  where Product2Id in: product.keySet() and Pricebook2Id =:pbId]){
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
                    np.IsActive = true; 
                    toUpsert.add(np); 
                }
                upsert toUpsert; 
                messBack= 'success'; 
            }
        }catch(exception e){
            messBack = String.valueOf(e);
        }
        return messBack; 
    }
    public static string createAllTheThings(string accountId, list<CartItem> products){
        string messBack;
        list<PricebookEntry> pbeList = new list<PricebookEntry>();
        try{
         //get account details
         list<account> acc=[select id, name from account where id =: accountId ]; 
        //create price book
        Pricebook2 pb = new Pricebook2(name=acc[0].Name, isActive=true, Account_Based__c=true, Account_Based_Price_Book__c=true,Priority_Price_Book__c=true);
            insert pb; 
        //create price book entries
            for(CartItem x:products){
                PricebookEntry pbe = new PricebookEntry();
                pbe.Product2Id = x.Product2Id;
                pbe.UnitPrice = x.SalesPrice;
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
        messBack = 'success';
        }catch(exception e){
            messBack = string.valueOf(e);
        }

        return messBack;
    }
}
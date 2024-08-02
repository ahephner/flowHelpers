@isTest
public class test_omsPricingTool {
    @TestSetup static void setUp(){
         DateTime dt = DateTime.newInstance(2025, 5, 15, 12, 30, 0);
        
        //create test customer
        Account cust = new Account();
        cust.Name = 'Test123456';
        cust.Type = 'Customer';
        cust.Customer_Name__c = 'Test Customer 123456';
        cust.Buyer_Account_Created__c = true;
        insert cust;
        //buyer account
        BuyerAccount ba = new BuyerAccount(BuyerId= cust.Id,BuyerStatus='Active', CommerceType= 'Buyer', IsActive=true, Name='Aj Account');
        insert ba; 
        //Store
        WebStore store = new WebStore();
        store.Name = 'ATS B2B Store';
        store.SupportedLanguages = 'en_US';
        store.MaxValuesPerFacet = 100;
        store.DefaultLanguage = 'en_US';
        store.PricingStrategy = 'Priority';
        store.PaginationSize = 20;
        insert store; 
        //cart
        WebCart cart = new WebCart();
        cart.WebStoreId = store.id;
        cart.PoNumber = '123';
        cart.Status = 'Active';
		cart.Type = 'Cart';        
        cart.AccountId = cust.Id; 
        cart.Name = 'webcart';
        insert cart; 
        
        //Order Delivery Method
        OrderDeliveryMethod odm = new OrderDeliveryMethod(name='amazon');
        insert odm; 
        //cart delivery group
        CartDeliveryGroup cdg = new CartDeliveryGroup(name='Cart', CartId=cart.Id, DeliveryMethodId=odm.id, DesiredDeliveryDate = dt);
        insert cdg; 
        //Product
        product2 prod = new product2(name ='product', IsActive= True, ProductCode='123', Product_Status__c ='Stock', 
                                    Subcategory__c='Chemicals-Herbicide', Product_Family__c='FMC', Floor_Type__c ='Floor', Floor_Price__c = 1); 
        insert prod;
                //Product
        product2 prod2 = new product2(name ='roundup', IsActive= True, ProductCode='456', Product_Status__c ='Stock', 
                                    Subcategory__c='Chemicals-Herbicide', Product_Family__c='FMC', Floor_Type__c ='Floor', Floor_Price__c = 1); 
        insert prod2;
        //CartItem List
        List<CartItem> cartItems = new List<CartItem>();
        for(Integer i=0;i<2;i++){
           cartitem ci= new cartitem(AdjustmentAmount = 0,AdjustmentTaxAmount = 0,
                                       TotalAdjustmentAmount = 0, CartId= cart.id,
                                       Name='Cart Item '+i, GrossUnitPrice = 0,
                                       ListPrice= i,NetUnitPrice =0,
                                       Quantity = 1.00, SalesPrice = i,
                                       Sku = 'AJ '+i, TotalPriceAfterAllAdjustments = i,
           							   TotalPrice =i, UnitAdjustedPrice = 0, 
										UnitAdjustmentAmount=0, Product2Id=prod.id,
                                       CartDeliveryGroupId = cdg.id);
            if(i==0){
                ci.Product2Id = prod.Id;
            }else{
                ci.Product2Id = prod2.id;
            }
            cartItems.add(ci);
        
        }
        insert cartItems;
//standard price book 
        Id pricebook = Test.getStandardPricebookId();
                //Standard pricebook entry        
        PricebookEntry stpbe = new PricebookEntry(Pricebook2Id = pricebook, Product2Id=prod.id,
                                                 unitprice=90, IsActive = True, UseStandardPrice=False);
        insert stpbe;
        
                //Standard pricebook entry        
        PricebookEntry stpbe2 = new PricebookEntry(Pricebook2Id = pricebook, Product2Id=prod2.id,
                                                 unitprice=90, IsActive = True, UseStandardPrice=False);
        insert stpbe2;
        
        
    }
	@isTest
    static void test_pricebookFound(){
        
        
    }
    @isTest
    static void createAllTheThings(){
        list<account> acc = [select id, name from account where name='Test123456'];
        string accountName = acc[0].Id; 
        
        Id cart = [select id from WebCart where PoNumber = '123'].Id; 
        list<CartItem> prods = [Select product2Id, salesPrice from cartItem where cartId =: cart];
        test.startTest();
        	string foxtwo = omsPricingTool.createAllTheThings(accountName, prods);
        system.debug(foxtwo); 
        test.stopTest();
    }
}
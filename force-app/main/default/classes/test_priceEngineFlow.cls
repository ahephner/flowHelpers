@isTest
public class test_priceEngineFlow {
    @isTest
    static void pef(){
                //Product
            product2 prod = new product2(name ='product', IsActive= True, ProductCode='123', Product_Status__c ='Stock', 
            Subcategory__c='Fungicide', Product_Family__c='FMC', Floor_Type__c ='Floor', Floor_Price__c = 1); 
            insert prod;

                //standard price book 
        Id pricebook = Test.getStandardPricebookId();
        //Standard pricebook entry        
        PricebookEntry stpbe = new PricebookEntry(Pricebook2Id = pricebook, Product2Id=prod.id,
                                         unitprice=90, IsActive = True, UseStandardPrice=False);
insert stpbe;
        test.startTest();
         //   list<list<pricebookentry>> up = priceEngineFlow.CheckValues();
        test.stopTest();
    }
}
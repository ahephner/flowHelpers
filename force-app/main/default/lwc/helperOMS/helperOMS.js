//loading for the desktop version. accepts product list and assigns values
  //if you want to add another field to the screen start it here

  //oms need to pass the pricing array then in margin or whatever inof you need to pricingArray.find(prod => prod.productId === x.product2Id).fieldYouNeed
  const onLoadProductsOMS = (products, upPrices, recordId) =>{
    let count = 0;
    let prices = upPrices
    console.log('helper pricing ==> ', prices)
    let prod = products.map(x =>{
      count++   
        //console.log(JSON.stringify(products));
        return   {
            sObjectType: 'OpportunityLineItem',
            Id: x.Id,
            PricebookEntryId: x.PricebookEntryId,
            Product2Id: x.Product2Id,
            name: x.Product2.Name,
            ProductCode: x.Product2.ProductCode,
            Quantity: x.Quantity,
            lOne: x.Level_1_UserView__c,
            floorPrice: prices.find(a=> a.Product2Id === x.Product2Id).Floor_Price__c,
            //UnitPrice:x.Product2.Agency_Pricing__c ? x.Floor_Price__c: x.CPQ_Unit_Price__c,
            UnitPrice: prices.find(a=> a.Product2Id === x.Product2Id).UnitPrice,
            //MinPrice: x.UnitPrice, 
            CPQ_Margin__c: x.Product2.Agency_Pricing__c? '' : x.CPQ_Margin__c,
            Cost__c: x.Product_Cost__c,
            displayCost: x.Product2.Agency_Pricing__c ? 'Agency' : x.Product_Cost__c, 
            agency: x.Product2.Agency_Pricing__c ,
            wInv: x.Quantity_Available__c ? x.Quantity_Available__c : 0,
            lastPaid: x.Unit_Price__c ? '$'+x.Unit_Price__c : 0,
            lastMarg: x.Product2.Agency_Pricing__c ? '' : (x.Margin__c/100),
            companyLastPaid: x.Product2.Last_Purchase_Price__c,
            palletConfig: x.Product2.Pallet_Qty__c,
            docDate: x.Doc_Date__c, 
            TotalPrice: x.TotalPrice,
            Description: x.Description,
            Ship_Weight__c: x.Product2.Ship_Weight__c,
            lastPaidDate: x.Unit_Price__c ? '$'+x.Unit_Price__c +' '+x.Doc_Date__c : '', 
            showLastPaid: true,
            lastQuoteAmount: x.Last_Quote_Price__c,
            lastQuoteMargin: x.Last_Quote_Margin__c,
            lastQuoteDate: x.Quote_Date__c,
            flrText: 'flr price $'+ prices.find(a=> a.Product2Id === x.Product2Id).Floor_Price__c,
            lOneText: 'lev 1 $'+x.Level_1_UserView__c,
            sgn: x.Product2.SGN__c,
            goodPrice:x.Product2.Agency_Pricing__c ?true: (x.Floor_Price__c <= x.CPQ_Unit_Price__c ? true: false),
            resUse: x.Product2.RUP__c,
            manLine: x.Product2.ProductCode.includes('MANUAL CHARGE')  ? true : false,
            Line_Order__c: isNaN(Number(x.Line_Order__c))? count : Number(x.Line_Order__c) ,
            url: `https://advancedturf.lightning.force.com/lightning/r/${x.Product2Id}/related/ProductItems/view`, 
            //prodURL: `https://advancedturf--full.sandbox.lightning.force.com/lightning/r/Product2/${x.Product2Id}/view`,
            prodURL: `https://advancedturf.lightning.force.com/lightning/r/Product2/${x.Product2Id}/view`,
            OpportunityId: recordId
        } 
      })
//sort the array based on user input
//see below
    let sortedProd = sortArray(prod)
    //  console.log(JSON.stringify(prod));
    //console.log(typeof sortedProd[0].Line_Order__c, ' 2 ', sortedProd[0].Line_Order__c); 
    //  console.log('sorted below')
    //  console.log(JSON.stringify(sortedProd));
    return sortedProd; 
  }
  //sort the products on load to order by when they were added or rep has updated where they have been added
  //used for quoting tool when they want to group products together; 
  const sortArray = (el) =>{
    
    el.sort((a,b)=>{
      return a.Line_Order__c - b.Line_Order__c; 
    })
    return el; 
  }


// make it so functions can be used other pages
export{ 
        onLoadProductsOMS, 
        sortArray

      }
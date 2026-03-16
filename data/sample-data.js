// ═══════════════════════════════════════════════
// SAMPLE DATASETS
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// DATASET SETS — cohesive bundles with matching IDs
// All 3 sources in each set share consistent FK references:
//   orders.customer.ref  → customers.customerId
//   customers.account.managerId → workers.associateOID
// ═══════════════════════════════════════════════
const DATASET_SETS = [
  // ── SET 1: Acme Tech Retail ──────────────────
  {
    id: 'set-acme',
    name: 'Acme Tech Retail',
    icon: '🖥️',
    desc: '5 customers, 12 orders, 4 workers. A tech retail business. Customers have gold/silver/bronze loyalty tiers. Orders span Electronics and Accessories with shipping, discounts and campaign attribution. Workers include Sales AMs assigned to customers.',
    tags: ['retail', 'e-commerce', 'tech'],
    sources: {
      customers: [
        { customerId:'CUST-001', externalRef:{crm:'SF-00100',erp:'ERP-441'}, profile:{name:{given:'Alice',middle:'J',family:'Chen',formatted:'Alice J. Chen'},dateOfBirth:'1988-04-12',gender:{code:'F',label:'Female'},identityVerified:true}, contact:{emails:[{type:'PRIMARY',address:'alice.chen@example.com',verified:true,marketingOptIn:true},{type:'WORK',address:'alice@acmecorp.com',verified:true,marketingOptIn:false}],phones:[{type:'MOBILE',number:'+12125550101',countryCode:'US',smsOptIn:true}],preferredChannel:'EMAIL'}, addresses:[{type:'HOME',line1:'22 Waterville Rd',line2:'',city:'Avon',state:{code:'CT',name:'Connecticut'},postalCode:'06001',country:'US',isPrimary:true,validated:true}], loyalty:{tier:{code:'GOLD',label:'Gold',since:'2022-03-01'},points:{balance:4820,lifetime:12340,expiring:{amount:200,by:'2024-06-30'}},enrolled:true,enrolledAt:'2022-03-01'}, segments:[{id:'SEG-HIGH-LTV',label:'High LTV',assignedAt:'2023-09-15'},{id:'SEG-REPEAT',label:'Repeat Buyer',assignedAt:'2022-07-01'}], preferences:{language:'en-US',timezone:'America/New_York',notifications:{email:true,sms:false,push:true},categories:['Electronics','Accessories']}, metrics:{orders:{total:14,last90Days:3},spend:{lifetime:1842.50,last12Months:620.00,averageOrder:131.60},firstPurchase:'2022-03-15',lastPurchase:'2024-01-15',churnRisk:{score:0.12,label:'LOW',computedAt:'2024-01-10'}}, account:{status:{code:'ACTIVE',since:'2022-03-01'},managerId:'W-AM-001',createdAt:'2022-03-01T08:30:00Z',updatedAt:'2024-01-15T09:23:11Z',tags:['vip','early-adopter']} },
        { customerId:'CUST-002', externalRef:{crm:'SF-00101',erp:'ERP-442'}, profile:{name:{given:'Bob',middle:'',family:'Kim',formatted:'Bob Kim'},dateOfBirth:'1993-11-28',gender:{code:'M',label:'Male'},identityVerified:true}, contact:{emails:[{type:'PRIMARY',address:'bob.kim@example.com',verified:true,marketingOptIn:false}],phones:[{type:'MOBILE',number:'+13105550202',countryCode:'US',smsOptIn:false}],preferredChannel:'PUSH'}, addresses:[{type:'HOME',line1:'800 Sunset Blvd',line2:'Apt 4B',city:'Los Angeles',state:{code:'CA',name:'California'},postalCode:'90028',country:'US',isPrimary:true,validated:true}], loyalty:{tier:{code:'SILVER',label:'Silver',since:'2023-01-15'},points:{balance:1200,lifetime:3100,expiring:{amount:0,by:null}},enrolled:true,enrolledAt:'2023-01-15'}, segments:[{id:'SEG-REPEAT',label:'Repeat Buyer',assignedAt:'2023-06-01'}], preferences:{language:'en-US',timezone:'America/Los_Angeles',notifications:{email:true,sms:false,push:false},categories:['Electronics']}, metrics:{orders:{total:6,last90Days:1},spend:{lifetime:780.00,last12Months:154.68,averageOrder:130.00},firstPurchase:'2023-01-20',lastPurchase:'2024-01-16',churnRisk:{score:0.38,label:'MEDIUM',computedAt:'2024-01-10'}}, account:{status:{code:'ACTIVE',since:'2023-01-15'},managerId:'W-AM-001',createdAt:'2023-01-15T14:00:00Z',updatedAt:'2024-01-16T11:06:00Z',tags:['deal-seeker']} },
        { customerId:'CUST-003', externalRef:{crm:'SF-00102',erp:'ERP-443'}, profile:{name:{given:'Carol',middle:'A',family:'Day',formatted:'Carol A. Day'},dateOfBirth:'1985-07-30',gender:{code:'F',label:'Female'},identityVerified:true}, contact:{emails:[{type:'PRIMARY',address:'carol.day@example.com',verified:true,marketingOptIn:true}],phones:[{type:'MOBILE',number:'+13125550303',countryCode:'US',smsOptIn:true}],preferredChannel:'EMAIL'}, addresses:[{type:'HOME',line1:'412 Lakeshore Dr',line2:'',city:'Chicago',state:{code:'IL',name:'Illinois'},postalCode:'60601',country:'US',isPrimary:true,validated:true}], loyalty:{tier:{code:'PLATINUM',label:'Platinum',since:'2021-06-01'},points:{balance:9200,lifetime:28000,expiring:{amount:500,by:'2024-06-30'}},enrolled:true,enrolledAt:'2021-06-01'}, segments:[{id:'SEG-HIGH-LTV',label:'High LTV',assignedAt:'2022-01-01'},{id:'SEG-VIP',label:'VIP',assignedAt:'2022-06-01'}], preferences:{language:'en-US',timezone:'America/Chicago',notifications:{email:true,sms:true,push:true},categories:['Electronics','Audio','Accessories']}, metrics:{orders:{total:28,last90Days:5},spend:{lifetime:5240.00,last12Months:1180.00,averageOrder:187.14},firstPurchase:'2021-06-10',lastPurchase:'2024-01-17',churnRisk:{score:0.06,label:'LOW',computedAt:'2024-01-10'}}, account:{status:{code:'ACTIVE',since:'2021-06-01'},managerId:'W-AM-002',createdAt:'2021-06-01T10:00:00Z',updatedAt:'2024-01-17T16:00:00Z',tags:['vip','advocate']} },
        { customerId:'CUST-004', externalRef:{crm:'SF-00103',erp:'ERP-444'}, profile:{name:{given:'David',middle:'',family:'Park',formatted:'David Park'},dateOfBirth:'1990-02-14',gender:{code:'M',label:'Male'},identityVerified:false}, contact:{emails:[{type:'PRIMARY',address:'david.park@example.com',verified:true,marketingOptIn:false}],phones:[{type:'MOBILE',number:'+15125550404',countryCode:'US',smsOptIn:false}],preferredChannel:'EMAIL'}, addresses:[{type:'HOME',line1:'78 Barton Springs Rd',line2:'Suite 2',city:'Austin',state:{code:'TX',name:'Texas'},postalCode:'78704',country:'US',isPrimary:true,validated:false}], loyalty:{tier:{code:'BRONZE',label:'Bronze',since:'2023-09-01'},points:{balance:320,lifetime:420,expiring:{amount:0,by:null}},enrolled:true,enrolledAt:'2023-09-01'}, segments:[{id:'SEG-NEW',label:'New Customer',assignedAt:'2023-09-01'}], preferences:{language:'en-US',timezone:'America/Chicago',notifications:{email:true,sms:false,push:false},categories:['Accessories']}, metrics:{orders:{total:2,last90Days:1},spend:{lifetime:142.97,last12Months:142.97,averageOrder:71.49},firstPurchase:'2023-09-15',lastPurchase:'2024-01-18',churnRisk:{score:0.61,label:'HIGH',computedAt:'2024-01-10'}}, account:{status:{code:'ACTIVE',since:'2023-09-01'},managerId:'W-AM-002',createdAt:'2023-09-01T09:00:00Z',updatedAt:'2024-01-18T10:00:00Z',tags:['at-risk']} },
        { customerId:'CUST-005', externalRef:{crm:'SF-00104',erp:'ERP-445'}, profile:{name:{given:'Eva',middle:'',family:'Martinez',formatted:'Eva Martinez'},dateOfBirth:'1996-05-19',gender:{code:'F',label:'Female'},identityVerified:true}, contact:{emails:[{type:'PRIMARY',address:'eva.martinez@example.com',verified:true,marketingOptIn:true}],phones:[{type:'MOBILE',number:'+12065550505',countryCode:'US',smsOptIn:true}],preferredChannel:'PUSH'}, addresses:[{type:'HOME',line1:'300 Pike St',line2:'Apt 12',city:'Seattle',state:{code:'WA',name:'Washington'},postalCode:'98101',country:'US',isPrimary:true,validated:true}], loyalty:{tier:{code:'SILVER',label:'Silver',since:'2023-04-01'},points:{balance:2100,lifetime:4400,expiring:{amount:100,by:'2024-06-30'}},enrolled:true,enrolledAt:'2023-04-01'}, segments:[{id:'SEG-REPEAT',label:'Repeat Buyer',assignedAt:'2023-10-01'},{id:'SEG-MOBILE',label:'Mobile Shopper',assignedAt:'2023-04-01'}], preferences:{language:'en-US',timezone:'America/Los_Angeles',notifications:{email:false,sms:true,push:true},categories:['Electronics','Audio']}, metrics:{orders:{total:9,last90Days:2},spend:{lifetime:1120.00,last12Months:480.00,averageOrder:124.44},firstPurchase:'2023-04-10',lastPurchase:'2024-01-14',churnRisk:{score:0.22,label:'LOW',computedAt:'2024-01-10'}}, account:{status:{code:'ACTIVE',since:'2023-04-01'},managerId:'W-AM-001',createdAt:'2023-04-01T11:00:00Z',updatedAt:'2024-01-14T15:00:00Z',tags:['mobile-first']} }
      ],
      orders: [
        { orderId:'ORD-1001', placedAt:'2024-01-10T09:00:00Z', status:{code:'DELIVERED',label:'Delivered',updatedAt:'2024-01-13T14:00:00Z'}, customer:{id:1,ref:'CUST-001'}, lineItems:[{lineId:1,product:{id:201,sku:'WM-001',name:'Wireless Mouse',category:{code:'ELEC',label:'Electronics'}},quantity:2,unitPrice:{amount:24.99,currency:'USD'},discount:{type:'PERCENT',value:5,applied:true},totals:{subtotal:49.98,discountAmount:2.50,lineTotal:47.48}},{lineId:2,product:{id:203,sku:'UH-003',name:'USB Hub',category:{code:'ACC',label:'Accessories'}},quantity:1,unitPrice:{amount:29.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:29.99,discountAmount:0,lineTotal:29.99}}], shipping:{method:{code:'GROUND',label:'Ground Shipping'},address:{line1:'22 Waterville Rd',city:'Avon',state:{code:'CT',name:'Connecticut'},postalCode:'06001',country:'US'},tracking:{carrier:'UPS',number:'1Z999AA10123456784',estimatedDelivery:'2024-01-13'},cost:{amount:5.99,currency:'USD'}}, payment:{method:{type:'CARD',brand:'Visa',lastFour:'4242'},billing:{line1:'22 Waterville Rd',city:'Avon',postalCode:'06001',country:'US'},totals:{subtotal:77.47,tax:6.97,shipping:5.99,grandTotal:90.43},transactions:[{id:'TXN-8821',status:'SETTLED',amount:90.43,at:'2024-01-10T09:01:00Z'}]}, metadata:{source:'web',campaign:{id:'WINTER24',medium:'email'},notes:''} },
        { orderId:'ORD-1002', placedAt:'2024-01-12T11:30:00Z', status:{code:'SHIPPED',label:'Shipped',updatedAt:'2024-01-13T10:00:00Z'}, customer:{id:2,ref:'CUST-002'}, lineItems:[{lineId:1,product:{id:202,sku:'KB-002',name:'Mechanical Keyboard',category:{code:'ELEC',label:'Electronics'}},quantity:1,unitPrice:{amount:129.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:129.99,discountAmount:0,lineTotal:129.99}}], shipping:{method:{code:'EXPRESS',label:'2-Day Express'},address:{line1:'800 Sunset Blvd',city:'Los Angeles',state:{code:'CA',name:'California'},postalCode:'90028',country:'US'},tracking:{carrier:'FedEx',number:'7489234590128',estimatedDelivery:'2024-01-14'},cost:{amount:12.99,currency:'USD'}}, payment:{method:{type:'CARD',brand:'Mastercard',lastFour:'5555'},billing:{line1:'800 Sunset Blvd',city:'Los Angeles',postalCode:'90028',country:'US'},totals:{subtotal:129.99,tax:11.70,shipping:12.99,grandTotal:154.68},transactions:[{id:'TXN-8822',status:'SETTLED',amount:154.68,at:'2024-01-12T11:31:00Z'}]}, metadata:{source:'mobile',campaign:{id:'NEWYEAR24',medium:'push'},notes:'Gift wrap requested'} },
        { orderId:'ORD-1003', placedAt:'2024-01-14T15:00:00Z', status:{code:'DELIVERED',label:'Delivered',updatedAt:'2024-01-17T12:00:00Z'}, customer:{id:3,ref:'CUST-003'}, lineItems:[{lineId:1,product:{id:206,sku:'HP-006',name:'Headphones Pro',category:{code:'AUDIO',label:'Audio'}},quantity:1,unitPrice:{amount:199.99,currency:'USD'},discount:{type:'PERCENT',value:10,applied:true},totals:{subtotal:199.99,discountAmount:20.00,lineTotal:179.99}},{lineId:2,product:{id:204,sku:'WC-004',name:'Webcam HD',category:{code:'ELEC',label:'Electronics'}},quantity:1,unitPrice:{amount:79.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:79.99,discountAmount:0,lineTotal:79.99}}], shipping:{method:{code:'EXPRESS',label:'2-Day Express'},address:{line1:'412 Lakeshore Dr',city:'Chicago',state:{code:'IL',name:'Illinois'},postalCode:'60601',country:'US'},tracking:{carrier:'FedEx',number:'7489234590200',estimatedDelivery:'2024-01-16'},cost:{amount:12.99,currency:'USD'}}, payment:{method:{type:'CARD',brand:'Amex',lastFour:'0005'},billing:{line1:'412 Lakeshore Dr',city:'Chicago',postalCode:'60601',country:'US'},totals:{subtotal:259.98,tax:23.40,shipping:12.99,grandTotal:276.37},transactions:[{id:'TXN-8823',status:'SETTLED',amount:276.37,at:'2024-01-14T15:01:00Z'}]}, metadata:{source:'web',campaign:{id:'FLASH_JAN',medium:'social'},notes:''} },
        { orderId:'ORD-1004', placedAt:'2024-01-15T08:45:00Z', status:{code:'SHIPPED',label:'Shipped',updatedAt:'2024-01-16T09:00:00Z'}, customer:{id:1,ref:'CUST-001'}, lineItems:[{lineId:1,product:{id:205,sku:'MS-005',name:'Monitor Stand',category:{code:'ACC',label:'Accessories'}},quantity:2,unitPrice:{amount:49.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:99.98,discountAmount:0,lineTotal:99.98}}], shipping:{method:{code:'GROUND',label:'Ground Shipping'},address:{line1:'22 Waterville Rd',city:'Avon',state:{code:'CT',name:'Connecticut'},postalCode:'06001',country:'US'},tracking:{carrier:'UPS',number:'1Z999AA10123456800',estimatedDelivery:'2024-01-19'},cost:{amount:5.99,currency:'USD'}}, payment:{method:{type:'CARD',brand:'Visa',lastFour:'4242'},billing:{line1:'22 Waterville Rd',city:'Avon',postalCode:'06001',country:'US'},totals:{subtotal:99.98,tax:9.00,shipping:5.99,grandTotal:114.97},transactions:[{id:'TXN-8824',status:'SETTLED',amount:114.97,at:'2024-01-15T08:46:00Z'}]}, metadata:{source:'web',campaign:{id:'WINTER24',medium:'email'},notes:''} },
        { orderId:'ORD-1005', placedAt:'2024-01-16T14:20:00Z', status:{code:'PENDING',label:'Pending',updatedAt:'2024-01-16T14:20:00Z'}, customer:{id:4,ref:'CUST-004'}, lineItems:[{lineId:1,product:{id:207,sku:'CB-007',name:'USB-C Cable',category:{code:'ACC',label:'Accessories'}},quantity:3,unitPrice:{amount:12.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:38.97,discountAmount:0,lineTotal:38.97}},{lineId:2,product:{id:203,sku:'UH-003',name:'USB Hub',category:{code:'ACC',label:'Accessories'}},quantity:1,unitPrice:{amount:29.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:29.99,discountAmount:0,lineTotal:29.99}}], shipping:{method:{code:'GROUND',label:'Ground Shipping'},address:{line1:'78 Barton Springs Rd',city:'Austin',state:{code:'TX',name:'Texas'},postalCode:'78704',country:'US'},tracking:{carrier:'USPS',number:'9400111899223491568849',estimatedDelivery:'2024-01-22'},cost:{amount:5.99,currency:'USD'}}, payment:{method:{type:'PAYPAL',brand:'PayPal',lastFour:null},billing:{line1:'78 Barton Springs Rd',city:'Austin',postalCode:'78704',country:'US'},totals:{subtotal:68.96,tax:6.21,shipping:5.99,grandTotal:81.16},transactions:[{id:'TXN-8825',status:'AUTHORIZED',amount:81.16,at:'2024-01-16T14:21:00Z'}]}, metadata:{source:'mobile',campaign:{id:'ORGANIC',medium:'direct'},notes:''} },
        { orderId:'ORD-1006', placedAt:'2024-01-13T10:10:00Z', status:{code:'DELIVERED',label:'Delivered',updatedAt:'2024-01-16T11:00:00Z'}, customer:{id:5,ref:'CUST-005'}, lineItems:[{lineId:1,product:{id:204,sku:'WC-004',name:'Webcam HD',category:{code:'ELEC',label:'Electronics'}},quantity:1,unitPrice:{amount:79.99,currency:'USD'},discount:{type:'PERCENT',value:5,applied:true},totals:{subtotal:79.99,discountAmount:4.00,lineTotal:75.99}},{lineId:2,product:{id:207,sku:'CB-007',name:'USB-C Cable',category:{code:'ACC',label:'Accessories'}},quantity:2,unitPrice:{amount:12.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:25.98,discountAmount:0,lineTotal:25.98}}], shipping:{method:{code:'GROUND',label:'Ground Shipping'},address:{line1:'300 Pike St',city:'Seattle',state:{code:'WA',name:'Washington'},postalCode:'98101',country:'US'},tracking:{carrier:'DHL',number:'JD000060009330',estimatedDelivery:'2024-01-16'},cost:{amount:5.99,currency:'USD'}}, payment:{method:{type:'CARD',brand:'Visa',lastFour:'1111'},billing:{line1:'300 Pike St',city:'Seattle',postalCode:'98101',country:'US'},totals:{subtotal:101.97,tax:9.18,shipping:5.99,grandTotal:117.14},transactions:[{id:'TXN-8826',status:'SETTLED',amount:117.14,at:'2024-01-13T10:11:00Z'}]}, metadata:{source:'app',campaign:{id:'FLASH_JAN',medium:'push'},notes:''} },
        { orderId:'ORD-1007', placedAt:'2024-01-17T16:00:00Z', status:{code:'CANCELLED',label:'Cancelled',updatedAt:'2024-01-17T18:00:00Z'}, customer:{id:2,ref:'CUST-002'}, lineItems:[{lineId:1,product:{id:205,sku:'MS-005',name:'Monitor Stand',category:{code:'ACC',label:'Accessories'}},quantity:1,unitPrice:{amount:49.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:49.99,discountAmount:0,lineTotal:49.99}}], shipping:{method:{code:'GROUND',label:'Ground Shipping'},address:{line1:'800 Sunset Blvd',city:'Los Angeles',state:{code:'CA',name:'California'},postalCode:'90028',country:'US'},tracking:{carrier:'UPS',number:null,estimatedDelivery:null},cost:{amount:5.99,currency:'USD'}}, payment:{method:{type:'CARD',brand:'Mastercard',lastFour:'5555'},billing:{line1:'800 Sunset Blvd',city:'Los Angeles',postalCode:'90028',country:'US'},totals:{subtotal:49.99,tax:4.50,shipping:5.99,grandTotal:60.48},transactions:[{id:'TXN-8827',status:'VOIDED',amount:0,at:'2024-01-17T18:01:00Z'}]}, metadata:{source:'web',campaign:{id:'ORGANIC',medium:'direct'},notes:'Customer requested cancellation'} },
        { orderId:'ORD-1008', placedAt:'2024-01-18T09:30:00Z', status:{code:'SHIPPED',label:'Shipped',updatedAt:'2024-01-19T08:00:00Z'}, customer:{id:3,ref:'CUST-003'}, lineItems:[{lineId:1,product:{id:202,sku:'KB-002',name:'Mechanical Keyboard',category:{code:'ELEC',label:'Electronics'}},quantity:2,unitPrice:{amount:129.99,currency:'USD'},discount:{type:'PERCENT',value:15,applied:true},totals:{subtotal:259.98,discountAmount:39.00,lineTotal:220.98}}], shipping:{method:{code:'EXPRESS',label:'2-Day Express'},address:{line1:'412 Lakeshore Dr',city:'Chicago',state:{code:'IL',name:'Illinois'},postalCode:'60601',country:'US'},tracking:{carrier:'FedEx',number:'7489234590300',estimatedDelivery:'2024-01-20'},cost:{amount:12.99,currency:'USD'}}, payment:{method:{type:'CARD',brand:'Amex',lastFour:'0005'},billing:{line1:'412 Lakeshore Dr',city:'Chicago',postalCode:'60601',country:'US'},totals:{subtotal:220.98,tax:19.89,shipping:12.99,grandTotal:253.86},transactions:[{id:'TXN-8828',status:'SETTLED',amount:253.86,at:'2024-01-18T09:31:00Z'}]}, metadata:{source:'web',campaign:{id:'WINTER24',medium:'email'},notes:''} },
        { orderId:'ORD-1009', placedAt:'2024-01-19T13:15:00Z', status:{code:'DELIVERED',label:'Delivered',updatedAt:'2024-01-22T10:00:00Z'}, customer:{id:5,ref:'CUST-005'}, lineItems:[{lineId:1,product:{id:201,sku:'WM-001',name:'Wireless Mouse',category:{code:'ELEC',label:'Electronics'}},quantity:1,unitPrice:{amount:24.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:24.99,discountAmount:0,lineTotal:24.99}},{lineId:2,product:{id:206,sku:'HP-006',name:'Headphones Pro',category:{code:'AUDIO',label:'Audio'}},quantity:1,unitPrice:{amount:199.99,currency:'USD'},discount:{type:'PERCENT',value:5,applied:true},totals:{subtotal:199.99,discountAmount:10.00,lineTotal:189.99}}], shipping:{method:{code:'EXPRESS',label:'2-Day Express'},address:{line1:'300 Pike St',city:'Seattle',state:{code:'WA',name:'Washington'},postalCode:'98101',country:'US'},tracking:{carrier:'DHL',number:'JD000060009400',estimatedDelivery:'2024-01-21'},cost:{amount:12.99,currency:'USD'}}, payment:{method:{type:'CARD',brand:'Visa',lastFour:'1111'},billing:{line1:'300 Pike St',city:'Seattle',postalCode:'98101',country:'US'},totals:{subtotal:214.98,tax:19.35,shipping:12.99,grandTotal:247.32},transactions:[{id:'TXN-8829',status:'SETTLED',amount:247.32,at:'2024-01-19T13:16:00Z'}]}, metadata:{source:'app',campaign:{id:'NEWYEAR24',medium:'social'},notes:''} },
        { orderId:'ORD-1010', placedAt:'2024-01-20T11:00:00Z', status:{code:'SHIPPED',label:'Shipped',updatedAt:'2024-01-21T09:00:00Z'}, customer:{id:1,ref:'CUST-001'}, lineItems:[{lineId:1,product:{id:206,sku:'HP-006',name:'Headphones Pro',category:{code:'AUDIO',label:'Audio'}},quantity:1,unitPrice:{amount:199.99,currency:'USD'},discount:{type:'PERCENT',value:10,applied:true},totals:{subtotal:199.99,discountAmount:20.00,lineTotal:179.99}}], shipping:{method:{code:'EXPRESS',label:'2-Day Express'},address:{line1:'22 Waterville Rd',city:'Avon',state:{code:'CT',name:'Connecticut'},postalCode:'06001',country:'US'},tracking:{carrier:'UPS',number:'1Z999AA10123499900',estimatedDelivery:'2024-01-22'},cost:{amount:12.99,currency:'USD'}}, payment:{method:{type:'CARD',brand:'Visa',lastFour:'4242'},billing:{line1:'22 Waterville Rd',city:'Avon',postalCode:'06001',country:'US'},totals:{subtotal:179.99,tax:16.20,shipping:12.99,grandTotal:209.18},transactions:[{id:'TXN-8830',status:'SETTLED',amount:209.18,at:'2024-01-20T11:01:00Z'}]}, metadata:{source:'web',campaign:{id:'FLASH_JAN',medium:'email'},notes:''} },
        { orderId:'ORD-1011', placedAt:'2024-01-21T08:00:00Z', status:{code:'PENDING',label:'Pending',updatedAt:'2024-01-21T08:00:00Z'}, customer:{id:4,ref:'CUST-004'}, lineItems:[{lineId:1,product:{id:201,sku:'WM-001',name:'Wireless Mouse',category:{code:'ELEC',label:'Electronics'}},quantity:1,unitPrice:{amount:24.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:24.99,discountAmount:0,lineTotal:24.99}}], shipping:{method:{code:'GROUND',label:'Ground Shipping'},address:{line1:'78 Barton Springs Rd',city:'Austin',state:{code:'TX',name:'Texas'},postalCode:'78704',country:'US'},tracking:{carrier:'USPS',number:null,estimatedDelivery:'2024-01-27'},cost:{amount:5.99,currency:'USD'}}, payment:{method:{type:'PAYPAL',brand:'PayPal',lastFour:null},billing:{line1:'78 Barton Springs Rd',city:'Austin',postalCode:'78704',country:'US'},totals:{subtotal:24.99,tax:2.25,shipping:5.99,grandTotal:33.23},transactions:[{id:'TXN-8831',status:'AUTHORIZED',amount:33.23,at:'2024-01-21T08:01:00Z'}]}, metadata:{source:'mobile',campaign:{id:'ORGANIC',medium:'direct'},notes:''} },
        { orderId:'ORD-1012', placedAt:'2024-01-22T17:30:00Z', status:{code:'DELIVERED',label:'Delivered',updatedAt:'2024-01-25T14:00:00Z'}, customer:{id:3,ref:'CUST-003'}, lineItems:[{lineId:1,product:{id:205,sku:'MS-005',name:'Monitor Stand',category:{code:'ACC',label:'Accessories'}},quantity:3,unitPrice:{amount:49.99,currency:'USD'},discount:{type:'PERCENT',value:10,applied:true},totals:{subtotal:149.97,discountAmount:15.00,lineTotal:134.97}},{lineId:2,product:{id:207,sku:'CB-007',name:'USB-C Cable',category:{code:'ACC',label:'Accessories'}},quantity:5,unitPrice:{amount:12.99,currency:'USD'},discount:{type:'NONE',value:0,applied:false},totals:{subtotal:64.95,discountAmount:0,lineTotal:64.95}}], shipping:{method:{code:'GROUND',label:'Ground Shipping'},address:{line1:'412 Lakeshore Dr',city:'Chicago',state:{code:'IL',name:'Illinois'},postalCode:'60601',country:'US'},tracking:{carrier:'UPS',number:'1Z999AA10123500000',estimatedDelivery:'2024-01-25'},cost:{amount:5.99,currency:'USD'}}, payment:{method:{type:'CARD',brand:'Amex',lastFour:'0005'},billing:{line1:'412 Lakeshore Dr',city:'Chicago',postalCode:'60601',country:'US'},totals:{subtotal:199.92,tax:17.99,shipping:5.99,grandTotal:223.90},transactions:[{id:'TXN-8832',status:'SETTLED',amount:223.90,at:'2024-01-22T17:31:00Z'}]}, metadata:{source:'web',campaign:{id:'WINTER24',medium:'email'},notes:'Bulk order - office supplies'} }
      ],
      workers: [
        { associateOID:'W-AM-001', workerID:{idValue:'EMP-5001'}, person:{birthDate:'1985-03-15',deceasedIndicator:false,genderCode:{codeValue:'F',longName:'Woman/Female'},legalName:{givenName:'Sarah',familyName1:'Johnson',formattedName:'Johnson,Sarah'},preferredName:{givenName:'Sarah',familyName1:'Johnson',formattedName:'Sarah Johnson'},legalAddress:{lineOne:'101 Park Ave',cityName:'New York',countrySubdivisionLevel1:{subdivisionType:'State',codeValue:'NY',longName:'New York'},countryCode:'US',postalCode:'10001'},maritalStatusCode:{codeValue:'M',longName:'Married'},communication:{emails:[{itemID:'Personal',nameCode:{shortName:'Personal'},emailUri:'sarah.johnson@personal.com'}],mobiles:[{itemID:'CEL1',nameCode:{codeValue:'CEL1',longName:'Mobile'},formattedNumber:'2125550601'}]}}, workerDates:{originalHireDate:'2019-06-01',adjustedServiceDate:'2019-06-01'}, workerStatus:{statusCode:{codeValue:'A',longName:'Active'}}, businessCommunication:{emails:[{itemID:'Business',nameCode:{shortName:'Business'},emailUri:'sarah.johnson@company.com'}]}, workAssignments:[{itemID:'0',primaryIndicator:true,hireDate:'2019-06-01',assignmentStatus:{statusCode:{codeValue:'A',longName:'Active'}},jobTitle:'Senior Account Executive',standardHours:{hoursQuantity:40,unitCode:{codeValue:'H',longName:'Hour'}},workerTypeCode:{codeValue:'Salaried',longName:'Salaried Employee'},homeOrganizationalUnits:[{nameCode:{codeValue:'Department',longName:'Department'},organizationalUnitCode:{codeValue:'D-SALES',longName:'Sales'}},{nameCode:{codeValue:'BusinessUnit',longName:'Business Unit'},organizationalUnitCode:{codeValue:'BU-REV',longName:'Revenue'}}],baseRemuneration:{payPeriodRate:{amountValue:3077,currencyCode:'USD'},annualRate:{amountValue:80000,currencyCode:'USD'}},payGradeCode:{codeValue:'C26',longName:'Salary Level 3'}}], salesMetrics:{assignedCustomers:['CUST-001','CUST-002','CUST-005'],quota:{annual:{amount:2000000,currency:'USD'}},attainment:{ytd:{amount:847320,currency:'USD'},percentage:42.4}} },
        { associateOID:'W-AM-002', workerID:{idValue:'EMP-5002'}, person:{birthDate:'1988-09-22',deceasedIndicator:false,genderCode:{codeValue:'M',longName:'Man/Male'},legalName:{givenName:'Marcus',familyName1:'Thompson',formattedName:'Thompson,Marcus'},preferredName:{givenName:'Marcus',familyName1:'Thompson',formattedName:'Marcus Thompson'},legalAddress:{lineOne:'500 Michigan Ave',cityName:'Chicago',countrySubdivisionLevel1:{subdivisionType:'State',codeValue:'IL',longName:'Illinois'},countryCode:'US',postalCode:'60611'},maritalStatusCode:{codeValue:'S',longName:'Single'},communication:{emails:[{itemID:'Personal',nameCode:{shortName:'Personal'},emailUri:'marcus.t@personal.com'}],mobiles:[{itemID:'CEL1',nameCode:{codeValue:'CEL1',longName:'Mobile'},formattedNumber:'3125550602'}]}}, workerDates:{originalHireDate:'2020-02-15',adjustedServiceDate:'2020-02-15'}, workerStatus:{statusCode:{codeValue:'A',longName:'Active'}}, businessCommunication:{emails:[{itemID:'Business',nameCode:{shortName:'Business'},emailUri:'marcus.thompson@company.com'}]}, workAssignments:[{itemID:'0',primaryIndicator:true,hireDate:'2020-02-15',assignmentStatus:{statusCode:{codeValue:'A',longName:'Active'}},jobTitle:'Account Executive',standardHours:{hoursQuantity:40,unitCode:{codeValue:'H',longName:'Hour'}},workerTypeCode:{codeValue:'Salaried',longName:'Salaried Employee'},homeOrganizationalUnits:[{nameCode:{codeValue:'Department',longName:'Department'},organizationalUnitCode:{codeValue:'D-SALES',longName:'Sales'}},{nameCode:{codeValue:'BusinessUnit',longName:'Business Unit'},organizationalUnitCode:{codeValue:'BU-REV',longName:'Revenue'}}],baseRemuneration:{payPeriodRate:{amountValue:2692,currencyCode:'USD'},annualRate:{amountValue:70000,currencyCode:'USD'}},payGradeCode:{codeValue:'C24',longName:'Salary Level 1'}}], salesMetrics:{assignedCustomers:['CUST-003','CUST-004'],quota:{annual:{amount:1500000,currency:'USD'}},attainment:{ytd:{amount:530226,currency:'USD'},percentage:35.3}} },
        { associateOID:'W-ENG-001', workerID:{idValue:'EMP-5003'}, person:{birthDate:'1991-07-04',deceasedIndicator:false,genderCode:{codeValue:'F',longName:'Woman/Female'},legalName:{givenName:'Priya',familyName1:'Sharma',formattedName:'Sharma,Priya'},preferredName:{givenName:'Priya',familyName1:'Sharma',formattedName:'Priya Sharma'},legalAddress:{lineOne:'200 Castro St',cityName:'San Francisco',countrySubdivisionLevel1:{subdivisionType:'State',codeValue:'CA',longName:'California'},countryCode:'US',postalCode:'94114'},maritalStatusCode:{codeValue:'S',longName:'Single'},communication:{emails:[{itemID:'Personal',nameCode:{shortName:'Personal'},emailUri:'priya.sharma@personal.com'}],mobiles:[{itemID:'CEL1',nameCode:{codeValue:'CEL1',longName:'Mobile'},formattedNumber:'4155550603'}]}}, workerDates:{originalHireDate:'2021-04-01',adjustedServiceDate:'2021-04-01'}, workerStatus:{statusCode:{codeValue:'A',longName:'Active'}}, businessCommunication:{emails:[{itemID:'Business',nameCode:{shortName:'Business'},emailUri:'priya.sharma@company.com'}]}, workAssignments:[{itemID:'0',primaryIndicator:true,hireDate:'2021-04-01',assignmentStatus:{statusCode:{codeValue:'A',longName:'Active'}},jobTitle:'Senior Software Engineer',standardHours:{hoursQuantity:40,unitCode:{codeValue:'H',longName:'Hour'}},workerTypeCode:{codeValue:'Salaried',longName:'Salaried Employee'},homeOrganizationalUnits:[{nameCode:{codeValue:'Department',longName:'Department'},organizationalUnitCode:{codeValue:'D-ENG',longName:'Engineering'}},{nameCode:{codeValue:'BusinessUnit',longName:'Business Unit'},organizationalUnitCode:{codeValue:'BU-TECH',longName:'Technology'}}],baseRemuneration:{payPeriodRate:{amountValue:4808,currencyCode:'USD'},annualRate:{amountValue:125000,currencyCode:'USD'}},payGradeCode:{codeValue:'C28',longName:'Salary Level 5'}}], salesMetrics:null },
        { associateOID:'W-FIN-001', workerID:{idValue:'EMP-5004'}, person:{birthDate:'1983-12-01',deceasedIndicator:false,genderCode:{codeValue:'M',longName:'Man/Male'},legalName:{givenName:'Lucas',familyName1:'Ferreira',formattedName:'Ferreira,Lucas'},preferredName:{givenName:'Lucas',familyName1:'Ferreira',formattedName:'Lucas Ferreira'},legalAddress:{lineOne:'88 Pine St',cityName:'New York',countrySubdivisionLevel1:{subdivisionType:'State',codeValue:'NY',longName:'New York'},countryCode:'US',postalCode:'10005'},maritalStatusCode:{codeValue:'M',longName:'Married'},communication:{emails:[{itemID:'Personal',nameCode:{shortName:'Personal'},emailUri:'lucas.f@personal.com'}],mobiles:[{itemID:'CEL1',nameCode:{codeValue:'CEL1',longName:'Mobile'},formattedNumber:'2125550604'}]}}, workerDates:{originalHireDate:'2018-09-10',adjustedServiceDate:'2018-09-10'}, workerStatus:{statusCode:{codeValue:'A',longName:'Active'}}, businessCommunication:{emails:[{itemID:'Business',nameCode:{shortName:'Business'},emailUri:'lucas.ferreira@company.com'}]}, workAssignments:[{itemID:'0',primaryIndicator:true,hireDate:'2018-09-10',assignmentStatus:{statusCode:{codeValue:'A',longName:'Active'}},jobTitle:'Finance Manager',standardHours:{hoursQuantity:40,unitCode:{codeValue:'H',longName:'Hour'}},workerTypeCode:{codeValue:'Salaried',longName:'Salaried Employee'},homeOrganizationalUnits:[{nameCode:{codeValue:'Department',longName:'Department'},organizationalUnitCode:{codeValue:'D-FIN',longName:'Finance'}},{nameCode:{codeValue:'BusinessUnit',longName:'Business Unit'},organizationalUnitCode:{codeValue:'BU-CORP',longName:'Corporate'}}],baseRemuneration:{payPeriodRate:{amountValue:3654,currencyCode:'USD'},annualRate:{amountValue:95000,currencyCode:'USD'}},payGradeCode:{codeValue:'M01',longName:'Manager Level 1'}}], salesMetrics:null }
      ]
    }
  }
];

// ═══════════════════════════════════════════════
// SAMPLE VIEWS (pre-built pipelines)
// ═══════════════════════════════════════════════
const SAMPLE_VIEWS = [
  // ─────────────────────────────────────────────────────────
  // VIEW 1: Full Customer Order Profile
  // orders + customers → join → filter → map → reshape → output
  // Output: nested per-customer doc with embedded order array
  // ─────────────────────────────────────────────────────────
  {
    id: 'view-customer-order-profile',
    name: 'Customer Order Profile',
    icon: '🧾',
    desc: 'Joins orders onto customers to produce one nested document per customer. Each doc contains identity, loyalty info, embedded order history with line items and payment summaries, and a computed spend roll-up.',
    pills: ['orders','customers','join','filter','map','output'],
    outputShape: {
      customerId: '$.customerId',
      identity: {
        name: '$.profile.name.formatted',
        email: '$.contact.emails[0].address',
        phone: '$.contact.phones[0].number'
      },
      loyalty: {
        tier: '$.loyalty.tier.code',
        points: '$.loyalty.points.balance',
        enrolled: '$.loyalty.enrolled'
      },
      riskSignals: {
        churnScore: '$.metrics.churnRisk.score',
        churnLabel: '$.metrics.churnRisk.label',
        lastPurchase: '$.metrics.lastPurchase'
      },
      orderHistory: {
        $from: 'orders',
        $match: 'orders.customer.ref == customers.customerId',
        $shape: {
          orderId: '$.orderId',
          placedAt: '$.placedAt',
          status: { code: '$.status.code', label: '$.status.label' },
          items: { $from: '$.lineItems', $shape: { sku: '$.product.sku', name: '$.product.name', qty: '$.quantity', total: '$.totals.lineTotal' } },
          payment: { method: '$.payment.method.brand', grandTotal: '$.payment.totals.grandTotal', currency: 'USD' },
          shipping: { carrier: '$.shipping.tracking.carrier', method: '$.shipping.method.label' }
        }
      },
      spendSummary: {
        lifetimeSpend: '$.metrics.spend.lifetime',
        avgOrderValue: '$.metrics.spend.averageOrder',
        totalOrders: '$.metrics.orders.total'
      }
    },
    requiredSources: ['orders','customers'],
    build(srcMap) {
      clearCanvas();
      const o = srcMap['orders'], c = srcMap['customers'];
      const n1 = createNode('source', 30, 40, {sourceId:o.id,sourceName:'orders',fields:[
        {name:'orderId',type:'str'},{name:'placedAt',type:'date'},{name:'customer.ref',type:'str'},
        {name:'status.code',type:'str'},{name:'status.label',type:'str'},
        {name:'lineItems[].product.sku',type:'str'},{name:'lineItems[].product.name',type:'str'},
        {name:'lineItems[].quantity',type:'num'},{name:'lineItems[].totals.lineTotal',type:'num'},
        {name:'payment.method.brand',type:'str'},{name:'payment.totals.grandTotal',type:'num'},
        {name:'shipping.method.label',type:'str'},{name:'shipping.tracking.carrier',type:'str'},
        {name:'metadata.campaign.medium',type:'str'}
      ]});
      const n2 = createNode('source', 30, 340, {sourceId:c.id,sourceName:'customers',fields:[
        {name:'customerId',type:'str'},{name:'profile.name.formatted',type:'str'},
        {name:'contact.emails[].address',type:'str'},{name:'contact.phones[].number',type:'str'},
        {name:'loyalty.tier.code',type:'str'},{name:'loyalty.points.balance',type:'num'},{name:'loyalty.enrolled',type:'bool'},
        {name:'metrics.churnRisk.score',type:'num'},{name:'metrics.churnRisk.label',type:'str'},
        {name:'metrics.spend.lifetime',type:'num'},{name:'metrics.spend.averageOrder',type:'num'},
        {name:'metrics.orders.total',type:'num'},{name:'metrics.lastPurchase',type:'date'}
      ]});
      const n3 = createNode('join',      310, 185, {label:'Join: orders → customers',joinType:'left',joinKey:'customer.ref'});
      const n4 = createNode('filter',    510, 185, {label:"Filter: active orders only",condition:"status.code != 'CANCELLED'"});
      const n5 = createNode('groupby',   710, 185, {label:'Group by customerId',groupFields:'customerId'});
      const n6 = createNode('map',       910, 185, {label:'Map: flatten join fields',fields:[
        {name:'customerId',type:'str'},{name:'profile.name.formatted',type:'str'},
        {name:'loyalty.tier.code',type:'str'},{name:'metrics.churnRisk.score',type:'num'},
        {name:'orderId',type:'str'},{name:'payment.totals.grandTotal',type:'num'}
      ]});
      const n7 = createNode('output',   1110, 185, {
        label:'Output: customer_order_profile',
        outputName:'customer_order_profile',
        outputSchema: this.outputShape
      });
      setTimeout(()=>{ addEdge(n1.id,n3.id); addEdge(n2.id,n3.id); addEdge(n3.id,n4.id); addEdge(n4.id,n5.id); addEdge(n5.id,n6.id); addEdge(n6.id,n7.id); },50);
    }
  },

  // ─────────────────────────────────────────────────────────
  // VIEW 2: Worker Compensation & Org Report
  // workers → map → groupby → aggregate → output
  // Output: nested org tree: BU → dept → workers with pay bands
  // ─────────────────────────────────────────────────────────
  {
    id: 'view-worker-comp-org',
    name: 'Worker Compensation & Org Tree',
    icon: '🏗️',
    desc: 'Builds a nested organisational tree from workers. Each Business Unit contains Departments, each Dept lists workers with their title, pay grade, annual salary, hire date and location — plus dept-level salary aggregations.',
    pills: ['workers','map','groupby','aggregate','sort','output'],
    outputShape: {
      businessUnit: '$.workAssignments[0].homeOrganizationalUnits[1].organizationalUnitCode.longName',
      departments: {
        $group: '$.workAssignments[0].homeOrganizationalUnits[0].organizationalUnitCode.longName',
        $shape: {
          department: '$key',
          headcount: { $agg: 'count' },
          payroll: {
            totalAnnual: { $agg: 'sum', $field: 'workAssignments[0].baseRemuneration.annualRate.amountValue' },
            avgAnnual:   { $agg: 'avg', $field: 'workAssignments[0].baseRemuneration.annualRate.amountValue' },
            minAnnual:   { $agg: 'min', $field: 'workAssignments[0].baseRemuneration.annualRate.amountValue' },
            maxAnnual:   { $agg: 'max', $field: 'workAssignments[0].baseRemuneration.annualRate.amountValue' }
          },
          workers: {
            $from: '$members',
            $shape: {
              associateOID: '$.associateOID',
              name: '$.person.legalName.formattedName',
              jobTitle: '$.workAssignments[0].jobTitle',
              payGrade: '$.workAssignments[0].payGradeCode.longName',
              annualSalary: '$.workAssignments[0].baseRemuneration.annualRate.amountValue',
              hireDate: '$.workerDates.originalHireDate',
              location: {
                city: '$.person.legalAddress.cityName',
                state: '$.person.legalAddress.countrySubdivisionLevel1.codeValue'
              },
              contact: {
                businessEmail: '$.businessCommunication.emails[0].emailUri',
                mobile: '$.person.communication.mobiles[0].formattedNumber'
              },
              status: '$.workerStatus.statusCode.longName'
            }
          }
        }
      }
    },
    requiredSources: ['workers'],
    build(srcMap) {
      clearCanvas();
      const w = srcMap['workers'];
      const n1 = createNode('source', 30, 80, {sourceId:w.id,sourceName:'workers',fields:[
        {name:'associateOID',type:'str'},
        {name:'person.legalName.formattedName',type:'str'},
        {name:'person.legalAddress.cityName',type:'str'},
        {name:'person.legalAddress.countrySubdivisionLevel1.codeValue',type:'str'},
        {name:'person.communication.mobiles[].formattedNumber',type:'str'},
        {name:'businessCommunication.emails[].emailUri',type:'str'},
        {name:'workerDates.originalHireDate',type:'date'},
        {name:'workerStatus.statusCode.longName',type:'str'},
        {name:'workAssignments[].jobTitle',type:'str'},
        {name:'workAssignments[].payGradeCode.longName',type:'str'},
        {name:'workAssignments[].baseRemuneration.annualRate.amountValue',type:'num'},
        {name:'workAssignments[].homeOrganizationalUnits[].organizationalUnitCode.longName',type:'str'},
        {name:'workAssignments[].homeOrganizationalUnits[].organizationalUnitCode.codeValue',type:'str'}
      ]});
      const n2 = createNode('filter',  280, 80,  {label:'Filter: active workers',condition:"workerStatus.statusCode.codeValue == 'A'"});
      const n3 = createNode('map',     470, 80,  {label:'Map: extract org + pay fields',fields:[
        {name:'associateOID',type:'str'},{name:'person.legalName.formattedName',type:'str'},
        {name:'workAssignments[].jobTitle',type:'str'},
        {name:'workAssignments[].payGradeCode.longName',type:'str'},
        {name:'workAssignments[].baseRemuneration.annualRate.amountValue',type:'num'},
        {name:'workAssignments[].homeOrganizationalUnits[].organizationalUnitCode.longName',type:'str'},
        {name:'workerDates.originalHireDate',type:'date'},
        {name:'person.legalAddress.cityName',type:'str'}
      ]});
      const n4 = createNode('groupby', 660, 80,  {label:'Group by Business Unit',groupFields:'workAssignments[].homeOrganizationalUnits[1].organizationalUnitCode.longName'});
      const n5 = createNode('aggregate',850, 80, {label:'Agg: total payroll per BU',aggFn:'sum',aggField:'workAssignments[].baseRemuneration.annualRate.amountValue'});
      const n6 = createNode('sort',   1040, 80,  {label:'Sort by dept name',sortField:'workAssignments[].homeOrganizationalUnits[0].organizationalUnitCode.longName',sortOrder:'asc'});
      const n7 = createNode('output', 1230, 80, {
        label:'Output: worker_comp_org_tree',
        outputName:'worker_comp_org_tree',
        outputSchema: this.outputShape
      });
      setTimeout(()=>{ addEdge(n1.id,n2.id); addEdge(n2.id,n3.id); addEdge(n3.id,n4.id); addEdge(n4.id,n5.id); addEdge(n5.id,n6.id); addEdge(n6.id,n7.id); },50);
    }
  },

  // ─────────────────────────────────────────────────────────
  // VIEW 3: Full Order Fulfilment Manifest
  // orders → filter (shipped) → map → output
  // Output: nested shipping manifest per order with full address, tracking, line-level detail
  // ─────────────────────────────────────────────────────────
  {
    id: 'view-fulfilment-manifest',
    name: 'Order Fulfilment Manifest',
    icon: '📦',
    desc: 'Produces a per-order fulfilment manifest for shipped/delivered orders. Each record is a self-contained document: full shipping address with state breakdown, carrier tracking, line-item pick list, payment confirmation, and campaign attribution.',
    pills: ['orders','filter','sort','map','output'],
    outputShape: {
      manifest: {
        orderId: '$.orderId',
        generatedAt: '$now',
        status: { code: '$.status.code', label: '$.status.label', updatedAt: '$.status.updatedAt' }
      },
      recipient: {
        customerId: '$.customer.ref',
        shippingAddress: {
          line1: '$.shipping.address.line1',
          city: '$.shipping.address.city',
          state: { code: '$.shipping.address.state.code', name: '$.shipping.address.state.name' },
          postalCode: '$.shipping.address.postalCode',
          country: '$.shipping.address.country'
        }
      },
      fulfilment: {
        method: { code: '$.shipping.method.code', label: '$.shipping.method.label' },
        cost: { amount: '$.shipping.cost.amount', currency: '$.shipping.cost.currency' },
        tracking: {
          carrier: '$.shipping.tracking.carrier',
          trackingNumber: '$.shipping.tracking.number',
          estimatedDelivery: '$.shipping.tracking.estimatedDelivery'
        }
      },
      pickList: {
        $from: '$.lineItems',
        $shape: {
          lineId: '$.lineId',
          sku: '$.product.sku',
          productName: '$.product.name',
          category: { code: '$.product.category.code', label: '$.product.category.label' },
          quantity: '$.quantity',
          unitPrice: { amount: '$.unitPrice.amount', currency: '$.unitPrice.currency' },
          discount: { applied: '$.discount.applied', type: '$.discount.type', value: '$.discount.value' },
          totals: { subtotal: '$.totals.subtotal', discountAmount: '$.totals.discountAmount', lineTotal: '$.totals.lineTotal' }
        }
      },
      paymentSummary: {
        method: { type: '$.payment.method.type', brand: '$.payment.method.brand', lastFour: '$.payment.method.lastFour' },
        totals: { subtotal: '$.payment.totals.subtotal', tax: '$.payment.totals.tax', shipping: '$.payment.totals.shipping', grandTotal: '$.payment.totals.grandTotal' },
        transaction: { id: '$.payment.transactions[0].id', status: '$.payment.transactions[0].status' }
      },
      attribution: { source: '$.metadata.source', campaign: { id: '$.metadata.campaign.id', medium: '$.metadata.campaign.medium' } }
    },
    requiredSources: ['orders'],
    build(srcMap) {
      clearCanvas();
      const o = srcMap['orders'];
      const n1 = createNode('source', 30, 80, {sourceId:o.id,sourceName:'orders',fields:[
        {name:'orderId',type:'str'},{name:'placedAt',type:'date'},
        {name:'status.code',type:'str'},{name:'status.label',type:'str'},{name:'status.updatedAt',type:'date'},
        {name:'customer.ref',type:'str'},
        {name:'lineItems[].lineId',type:'num'},{name:'lineItems[].product.sku',type:'str'},
        {name:'lineItems[].product.name',type:'str'},{name:'lineItems[].product.category.code',type:'str'},
        {name:'lineItems[].product.category.label',type:'str'},
        {name:'lineItems[].quantity',type:'num'},{name:'lineItems[].unitPrice.amount',type:'num'},
        {name:'lineItems[].discount.applied',type:'bool'},{name:'lineItems[].discount.type',type:'str'},
        {name:'lineItems[].totals.lineTotal',type:'num'},{name:'lineItems[].totals.discountAmount',type:'num'},
        {name:'shipping.address.line1',type:'str'},{name:'shipping.address.city',type:'str'},
        {name:'shipping.address.state.code',type:'str'},{name:'shipping.address.postalCode',type:'str'},
        {name:'shipping.method.label',type:'str'},{name:'shipping.cost.amount',type:'num'},
        {name:'shipping.tracking.carrier',type:'str'},{name:'shipping.tracking.number',type:'str'},
        {name:'shipping.tracking.estimatedDelivery',type:'date'},
        {name:'payment.method.type',type:'str'},{name:'payment.method.brand',type:'str'},
        {name:'payment.totals.grandTotal',type:'num'},{name:'payment.totals.tax',type:'num'},
        {name:'payment.transactions[].id',type:'str'},{name:'payment.transactions[].status',type:'str'},
        {name:'metadata.source',type:'str'},{name:'metadata.campaign.id',type:'str'},{name:'metadata.campaign.medium',type:'str'}
      ]});
      const n2 = createNode('filter',  310, 80, {label:"Filter: SHIPPED or DELIVERED",condition:"status.code == 'SHIPPED' || status.code == 'DELIVERED'"});
      const n3 = createNode('sort',    510, 80, {label:'Sort: most recent first',sortField:'placedAt',sortOrder:'desc'});
      const n4 = createNode('map',     700, 80, {label:'Map: full manifest fields',fields:[
        {name:'orderId',type:'str'},{name:'status.code',type:'str'},
        {name:'lineItems[].product.sku',type:'str'},{name:'lineItems[].quantity',type:'num'},
        {name:'shipping.tracking.carrier',type:'str'},{name:'payment.totals.grandTotal',type:'num'}
      ]});
      const n5 = createNode('output',  900, 80, {
        label:'Output: fulfilment_manifest',
        outputName:'fulfilment_manifest',
        outputSchema: this.outputShape
      });
      setTimeout(()=>{ addEdge(n1.id,n2.id); addEdge(n2.id,n3.id); addEdge(n3.id,n4.id); addEdge(n4.id,n5.id); },50);
    }
  },

  // ─────────────────────────────────────────────────────────
  // VIEW 4: Customer 360 + Worker Account Manager
  // orders + customers + workers → 2x join → filter → map → output
  // Output: enriched customer doc with embedded account manager from workers
  // ─────────────────────────────────────────────────────────
  {
    id: 'view-customer-360-with-am',
    name: 'Customer 360 with Account Manager',
    icon: '🌐',
    desc: 'Three-source view: joins customers with their order history and enriches with an assigned Account Manager from the workers source. Output is a nested 360° customer document with embedded orders, spend analytics, loyalty snapshot, and account manager contact card.',
    pills: ['orders','customers','workers','join','join','filter','map','output'],
    outputShape: {
      customer: {
        id: '$.customerId',
        profile: {
          name: '$.profile.name.formatted',
          dateOfBirth: '$.profile.dateOfBirth',
          gender: '$.profile.gender.label',
          identityVerified: '$.profile.identityVerified'
        },
        contact: {
          primaryEmail: '$.contact.emails[0].address',
          workEmail:    '$.contact.emails[1].address',
          mobile: '$.contact.phones[0].number',
          preferredChannel: '$.contact.preferredChannel'
        },
        address: {
          line1: '$.addresses[0].line1',
          city:  '$.addresses[0].city',
          state: '$.addresses[0].state.code',
          postalCode: '$.addresses[0].postalCode'
        }
      },
      loyalty: {
        tier: { code: '$.loyalty.tier.code', label: '$.loyalty.tier.label', memberSince: '$.loyalty.tier.since' },
        points: { balance: '$.loyalty.points.balance', lifetime: '$.loyalty.points.lifetime', expiring: { amount: '$.loyalty.points.expiring.amount', by: '$.loyalty.points.expiring.by' } },
        segments: { $from: '$.segments', $shape: { id: '$.id', label: '$.label' } }
      },
      analytics: {
        spend: { lifetime: '$.metrics.spend.lifetime', last12m: '$.metrics.spend.last12Months', avgOrder: '$.metrics.spend.averageOrder' },
        orders: { total: '$.metrics.orders.total', last90d: '$.metrics.orders.last90Days' },
        risk: { churnScore: '$.metrics.churnRisk.score', churnLabel: '$.metrics.churnRisk.label', computedAt: '$.metrics.churnRisk.computedAt' },
        dates: { firstPurchase: '$.metrics.firstPurchase', lastPurchase: '$.metrics.lastPurchase' }
      },
      recentOrders: {
        $from: 'orders',
        $match: 'orders.customer.ref == customers.customerId',
        $limit: 5,
        $shape: {
          orderId: '$.orderId', placedAt: '$.placedAt',
          status: '$.status.label', grandTotal: '$.payment.totals.grandTotal',
          itemCount: { $expr: 'length($.lineItems)' },
          channel: '$.metadata.source', campaign: '$.metadata.campaign.id'
        }
      },
      accountManager: {
        $from: 'workers',
        $match: 'workers.workAssignments[0].homeOrganizationalUnits[0].organizationalUnitCode.longName == "Sales"',
        $pickFirst: true,
        $shape: {
          associateOID: '$.associateOID',
          name: '$.person.legalName.formattedName',
          title: '$.workAssignments[0].jobTitle',
          email: '$.businessCommunication.emails[0].emailUri',
          phone: '$.person.communication.mobiles[0].formattedNumber',
          location: { city: '$.person.legalAddress.cityName', state: '$.person.legalAddress.countrySubdivisionLevel1.codeValue' }
        }
      }
    },
    requiredSources: ['orders','customers','workers'],
    build(srcMap) {
      clearCanvas();
      const o = srcMap['orders'], c = srcMap['customers'], w = srcMap['workers'];
      const n1 = createNode('source', 30, 40, {sourceId:o.id,sourceName:'orders',fields:[
        {name:'orderId',type:'str'},{name:'placedAt',type:'date'},{name:'customer.ref',type:'str'},
        {name:'status.label',type:'str'},{name:'payment.totals.grandTotal',type:'num'},
        {name:'metadata.source',type:'str'},{name:'metadata.campaign.id',type:'str'}
      ]});
      const n2 = createNode('source', 30, 280, {sourceId:c.id,sourceName:'customers',fields:[
        {name:'customerId',type:'str'},{name:'profile.name.formatted',type:'str'},
        {name:'profile.dateOfBirth',type:'date'},{name:'profile.gender.label',type:'str'},
        {name:'contact.emails[].address',type:'str'},{name:'contact.phones[].number',type:'str'},
        {name:'contact.preferredChannel',type:'str'},
        {name:'addresses[].line1',type:'str'},{name:'addresses[].city',type:'str'},
        {name:'loyalty.tier.code',type:'str'},{name:'loyalty.tier.label',type:'str'},{name:'loyalty.tier.since',type:'date'},
        {name:'loyalty.points.balance',type:'num'},{name:'loyalty.points.lifetime',type:'num'},
        {name:'loyalty.points.expiring.amount',type:'num'},
        {name:'segments[].id',type:'str'},{name:'segments[].label',type:'str'},
        {name:'metrics.spend.lifetime',type:'num'},{name:'metrics.spend.last12Months',type:'num'},
        {name:'metrics.orders.total',type:'num'},{name:'metrics.churnRisk.score',type:'num'},
        {name:'metrics.churnRisk.label',type:'str'},{name:'metrics.lastPurchase',type:'date'},
        {name:'account.status.code',type:'str'}
      ]});
      const n3 = createNode('source', 30, 530, {sourceId:w.id,sourceName:'workers',fields:[
        {name:'associateOID',type:'str'},{name:'person.legalName.formattedName',type:'str'},
        {name:'workAssignments[].jobTitle',type:'str'},
        {name:'workAssignments[].homeOrganizationalUnits[].organizationalUnitCode.longName',type:'str'},
        {name:'businessCommunication.emails[].emailUri',type:'str'},
        {name:'person.communication.mobiles[].formattedNumber',type:'str'},
        {name:'person.legalAddress.cityName',type:'str'}
      ]});
      const n4 = createNode('join',      310, 160, {label:'Join 1: orders → customers',joinType:'left',joinKey:'customer.ref'});
      const n5 = createNode('filter',    510, 160, {label:'Filter: active customers',condition:"account.status.code == 'ACTIVE'"});
      const n6 = createNode('filter',    310, 530, {label:'Filter: Sales dept workers',condition:"workAssignments[0].homeOrganizationalUnits[0].longName == 'Sales'"});
      const n7 = createNode('join',      710, 280, {label:'Join 2: enrich with AM',joinType:'left',joinKey:'customerId'});
      const n8 = createNode('map',       920, 280, {label:'Map: shape 360 fields',fields:[
        {name:'customerId',type:'str'},{name:'profile.name.formatted',type:'str'},
        {name:'loyalty.tier.code',type:'str'},{name:'metrics.churnRisk.score',type:'num'},
        {name:'orderId',type:'str'},{name:'payment.totals.grandTotal',type:'num'},
        {name:'associateOID',type:'str'},{name:'workAssignments[].jobTitle',type:'str'}
      ]});
      const n9 = createNode('output',   1120, 280, {
        label:'Output: customer_360',
        outputName:'customer_360',
        outputSchema: this.outputShape
      });
      setTimeout(()=>{ addEdge(n1.id,n4.id); addEdge(n2.id,n4.id); addEdge(n4.id,n5.id); addEdge(n3.id,n6.id); addEdge(n5.id,n7.id); addEdge(n6.id,n7.id); addEdge(n7.id,n8.id); addEdge(n8.id,n9.id); },50);
    }
  },

  // ─────────────────────────────────────────────────────────
  // VIEW 5: Campaign Attribution & Revenue Report
  // orders → groupby campaign → aggregate → join customers → map → output
  // Output: nested campaign doc with revenue breakdown, channel split, customer segment breakdown
  // ─────────────────────────────────────────────────────────
  {
    id: 'view-campaign-attribution',
    name: 'Campaign Attribution & Revenue',
    icon: '📣',
    desc: 'Groups all orders by campaign ID and channel, then aggregates revenue, order counts, and average order value. Enriches with a list of unique customer tiers who purchased through each campaign. Output is a nested campaign performance document.',
    pills: ['orders','customers','groupby','aggregate','join','map','output'],
    outputShape: {
      campaignId: '$.metadata.campaign.id',
      channel: { medium: '$.metadata.campaign.medium', source: '$.metadata.source' },
      performance: {
        totalOrders: { $agg: 'count' },
        revenue: {
          gross: { $agg: 'sum', $field: 'payment.totals.grandTotal' },
          tax:   { $agg: 'sum', $field: 'payment.totals.tax' },
          net:   { $expr: 'revenue.gross - revenue.tax' }
        },
        averageOrderValue: { $agg: 'avg', $field: 'payment.totals.grandTotal' },
        maxOrder: { $agg: 'max', $field: 'payment.totals.grandTotal' }
      },
      fulfilment: {
        shippingMethods: { $distinct: '$.shipping.method.label' },
        carriers: { $distinct: '$.shipping.tracking.carrier' },
        avgShippingCost: { $agg: 'avg', $field: 'shipping.cost.amount' }
      },
      ordersByStatus: {
        $group: '$.status.code',
        $shape: { status: '$key', count: { $agg: 'count' }, revenue: { $agg: 'sum', $field: 'payment.totals.grandTotal' } }
      },
      customerBreakdown: {
        $from: 'customers',
        $match: 'customers.customerId IN campaign.customerRefs',
        $shape: {
          uniqueCustomers: { $agg: 'count' },
          byTier: {
            $group: '$.loyalty.tier.code',
            $shape: { tier: '$key', count: { $agg: 'count' }, totalSpend: { $agg: 'sum', $field: 'metrics.spend.lifetime' } }
          },
          avgChurnRisk: { $agg: 'avg', $field: 'metrics.churnRisk.score' }
        }
      },
      topOrders: {
        $from: '$orders',
        $sort: { by: 'payment.totals.grandTotal', order: 'desc' },
        $limit: 3,
        $shape: { orderId: '$.orderId', customer: '$.customer.ref', total: '$.payment.totals.grandTotal', placedAt: '$.placedAt' }
      }
    },
    requiredSources: ['orders','customers'],
    build(srcMap) {
      clearCanvas();
      const o = srcMap['orders'], c = srcMap['customers'];
      const n1 = createNode('source', 30, 40, {sourceId:o.id,sourceName:'orders',fields:[
        {name:'orderId',type:'str'},{name:'placedAt',type:'date'},
        {name:'customer.ref',type:'str'},
        {name:'status.code',type:'str'},{name:'status.label',type:'str'},
        {name:'payment.totals.grandTotal',type:'num'},{name:'payment.totals.tax',type:'num'},
        {name:'payment.totals.shipping',type:'num'},
        {name:'shipping.method.label',type:'str'},{name:'shipping.tracking.carrier',type:'str'},
        {name:'shipping.cost.amount',type:'num'},
        {name:'metadata.campaign.id',type:'str'},{name:'metadata.campaign.medium',type:'str'},
        {name:'metadata.source',type:'str'}
      ]});
      const n2 = createNode('source', 30, 340, {sourceId:c.id,sourceName:'customers',fields:[
        {name:'customerId',type:'str'},{name:'loyalty.tier.code',type:'str'},
        {name:'loyalty.tier.label',type:'str'},{name:'metrics.spend.lifetime',type:'num'},
        {name:'metrics.churnRisk.score',type:'num'},{name:'account.status.code',type:'str'}
      ]});
      const n3 = createNode('filter',   290, 40,  {label:'Filter: completed orders',condition:"status.code != 'PENDING'"});
      const n4 = createNode('groupby',  480, 40,  {label:'Group by campaign + medium',groupFields:'metadata.campaign.id, metadata.source'});
      const n5 = createNode('aggregate',680, 40,  {label:'Agg: revenue per campaign',aggFn:'sum',aggField:'payment.totals.grandTotal'});
      const n6 = createNode('filter',   290, 340, {label:'Filter: active customers',condition:"account.status.code == 'ACTIVE'"});
      const n7 = createNode('join',     880, 190, {label:'Join: enrich with customer tiers',joinType:'left',joinKey:'customer.ref'});
      const n8 = createNode('sort',    1080, 190, {label:'Sort: highest revenue first',sortField:'payment.totals.grandTotal',sortOrder:'desc'});
      const n9 = createNode('map',     1270, 190, {label:'Map: campaign report shape',fields:[
        {name:'metadata.campaign.id',type:'str'},{name:'metadata.source',type:'str'},
        {name:'status.code',type:'str'},{name:'payment.totals.grandTotal',type:'num'},
        {name:'loyalty.tier.code',type:'str'},{name:'metrics.churnRisk.score',type:'num'}
      ]});
      const n10= createNode('output',  1460, 190, {
        label:'Output: campaign_attribution',
        outputName:'campaign_attribution',
        outputSchema: this.outputShape
      });
      setTimeout(()=>{
        addEdge(n1.id,n3.id); addEdge(n3.id,n4.id); addEdge(n4.id,n5.id);
        addEdge(n2.id,n6.id);
        addEdge(n5.id,n7.id); addEdge(n6.id,n7.id);
        addEdge(n7.id,n8.id); addEdge(n8.id,n9.id); addEdge(n9.id,n10.id);
      },50);
    }
  }
];

// helper to add edge programmatically
function addEdge(fromId, toId) {
  const dup = state.edges.find(e => e.from === fromId && e.to === toId);
  if (!dup) {
    state.edges.push({ id: 'e'+(++state.edgeIdCounter), from: fromId, to: toId });
    drawEdges(); updateStatus(); refreshDSL();
  }
}
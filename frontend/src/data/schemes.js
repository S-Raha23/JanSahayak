// Mirror of backend/data/schemes.js — kept in sync manually
// Source: myscheme.gov.in

export const SCHEMES = [
  { id:"pm-kisan",       name:"PM-KISAN",            short:"PM-KISAN",        category:"Agriculture",     type:"central", benefit:"₹6,000/year to farmers", tags:["farmer","agriculture","income support"], states:["all"] },
  { id:"kcc",            name:"Kisan Credit Card",    short:"KCC",             category:"Agriculture",     type:"central", benefit:"Crop loan at 4% interest", tags:["farmer","loan","credit"], states:["all"] },
  { id:"pmfby",          name:"PMFBY",                short:"Fasal Bima",      category:"Agriculture",     type:"central", benefit:"Crop insurance coverage", tags:["farmer","insurance","crop"], states:["all"] },
  { id:"pm-kusum",       name:"PM-KUSUM",             short:"PM-KUSUM",        category:"Agriculture",     type:"central", benefit:"Solar pump 90% subsidy", tags:["farmer","solar","irrigation"], states:["all"] },
  { id:"mnrega",         name:"MGNREGA",              short:"MNREGA",          category:"Employment",      type:"central", benefit:"100 days guaranteed work", tags:["rural","employment","labour"], states:["all"] },
  { id:"pmegp",          name:"PMEGP",                short:"PMEGP",           category:"Employment",      type:"central", benefit:"Startup subsidy 15–35%", tags:["entrepreneur","business","startup"], states:["all"] },
  { id:"pmsvnidhi",      name:"PM SVANidhi",          short:"SVANidhi",        category:"Employment",      type:"central", benefit:"₹10K–₹50K vendor loan", tags:["street vendor","loan","urban"], states:["all"] },
  { id:"ayushman",       name:"Ayushman Bharat",      short:"Ayushman",        category:"Health",          type:"central", benefit:"₹5L/year health insurance", tags:["health","insurance","BPL"], states:["all"] },
  { id:"janani",         name:"Janani Suraksha",      short:"JSY",             category:"Health",          type:"central", benefit:"₹1,400 delivery cash", tags:["women","maternal","pregnancy"], states:["all"] },
  { id:"pm-ujjwala",     name:"PM Ujjwala Yojana",   short:"Ujjwala",         category:"Health",          type:"central", benefit:"Free LPG connection", tags:["women","LPG","gas","BPL"], states:["all"] },
  { id:"pmay-g",         name:"PMAY Gramin",          short:"PMAY-G",          category:"Housing",         type:"central", benefit:"₹1.2L house grant", tags:["housing","rural","BPL"], states:["all"] },
  { id:"pmay-u",         name:"PMAY Urban",           short:"PMAY-U",          category:"Housing",         type:"central", benefit:"₹2.67L home loan subsidy", tags:["housing","urban","home loan"], states:["all"] },
  { id:"nsp-pre",        name:"Pre-Matric Scholarship",short:"NSP Pre",        category:"Education",       type:"central", benefit:"₹1,250/month for SC/ST/OBC students", tags:["student","scholarship","SC","ST"], states:["all"] },
  { id:"nsp-post",       name:"Post-Matric Scholarship",short:"NSP Post",      category:"Education",       type:"central", benefit:"₹7,000+/month for college", tags:["student","scholarship","college"], states:["all"] },
  { id:"merit-cum-means",name:"Merit-cum-Means",      short:"MCM Scholarship", category:"Education",       type:"central", benefit:"Full tuition + ₹20K/year", tags:["student","minority","scholarship"], states:["all"] },
  { id:"pm-vidyalaxmi",  name:"PM Vidyalaxmi",        short:"Vidyalaxmi",      category:"Education",       type:"central", benefit:"₹10L education loan", tags:["student","education loan","college"], states:["all"] },
  { id:"pmmvy",          name:"PM Matru Vandana",     short:"PMMVY",           category:"Women & Child",   type:"central", benefit:"₹5,000 for first birth", tags:["women","pregnancy","maternity"], states:["all"] },
  { id:"sukanya",        name:"Sukanya Samriddhi",    short:"SSY",             category:"Women & Child",   type:"central", benefit:"8.2% interest for girl child", tags:["girl child","savings","women"], states:["all"] },
  { id:"beti-bachao",    name:"Beti Bachao Beti Padhao",short:"BBBP",          category:"Women & Child",   type:"central", benefit:"Cash incentive for girl child", tags:["girl child","women","education"], states:["all"] },
  { id:"jan-dhan",       name:"Jan Dhan Yojana",      short:"PMJDY",           category:"Finance",         type:"central", benefit:"Zero-balance account + ₹2L insurance", tags:["bank","insurance","BPL"], states:["all"] },
  { id:"pm-mudra",       name:"PM MUDRA Yojana",      short:"MUDRA",           category:"Finance",         type:"central", benefit:"Business loan ₹50K–₹10L", tags:["business","loan","entrepreneur"], states:["all"] },
  { id:"pmjjby",         name:"PM Jeevan Jyoti Bima", short:"PMJJBY",          category:"Finance",         type:"central", benefit:"₹2L life cover at ₹436/year", tags:["insurance","life insurance"], states:["all"] },
  { id:"pmsby",          name:"PM Suraksha Bima",     short:"PMSBY",           category:"Finance",         type:"central", benefit:"₹2L accident cover at ₹20/year", tags:["insurance","accident"], states:["all"] },
  { id:"apl",            name:"Atal Pension Yojana",  short:"APY",             category:"Finance",         type:"central", benefit:"₹1K–₹5K/month pension", tags:["pension","retirement","labour"], states:["all"] },
  { id:"pmkvy",          name:"PM Kaushal Vikas",     short:"PMKVY",           category:"Skill Dev",       type:"central", benefit:"Free training + ₹8,000 reward", tags:["skill","training","youth","unemployed"], states:["all"] },
  { id:"deen-dayal",     name:"DDU-GKY",              short:"DDU-GKY",         category:"Skill Dev",       type:"central", benefit:"Free training + placement", tags:["skill","rural","youth","BPL"], states:["all"] },
  { id:"nsap",           name:"NSAP Old Age Pension", short:"IGNOAPS",         category:"Social Security", type:"central", benefit:"₹200–₹500/month pension", tags:["pension","elderly","BPL"], states:["all"] },
  { id:"nfbs",           name:"National Family Benefit",short:"NFBS",          category:"Social Security", type:"central", benefit:"₹20,000 on breadwinner death", tags:["death benefit","BPL","widow"], states:["all"] },
  { id:"pm-vishwakarma", name:"PM Vishwakarma",       short:"Vishwakarma",     category:"Artisan",         type:"central", benefit:"Toolkit + ₹2L loan at 5%", tags:["artisan","craftsman","carpenter","weaver"], states:["all"] },
  // State schemes
  { id:"up-bhu-lekh",        name:"UP Free Ration Scheme",    short:"UP Ration",   category:"Food Security",  type:"state", benefit:"5kg grain/person free", tags:["ration","food","BPL","UP"], states:["uttar pradesh"] },
  { id:"up-kanya-sumangala",  name:"Kanya Sumangala Yojana",  short:"Kanya Sumangala", category:"Women & Child", type:"state", benefit:"₹15,000 for girl child UP", tags:["girl child","UP","women"], states:["uttar pradesh"] },
  { id:"maharashtra-mahatma", name:"Mahatma Phule Jan Arogya",short:"MH Arogya",   category:"Health",          type:"state", benefit:"₹5L cashless treatment MH", tags:["health","Maharashtra","insurance"], states:["maharashtra"] },
  { id:"rajasthan-palanhar",  name:"Palanhar Yojana",         short:"Palanhar",    category:"Social Security", type:"state", benefit:"₹1,000/month for guardians", tags:["orphan","Rajasthan","SC"], states:["rajasthan"] },
  { id:"bihar-student",       name:"Bihar Student Credit Card",short:"Bihar SCC",  category:"Education",       type:"state", benefit:"₹4L education loan at 4%", tags:["student","Bihar","loan"], states:["bihar"] },
  { id:"tn-breakfast",        name:"TN CM Breakfast Scheme",  short:"TN Breakfast",category:"Education",       type:"state", benefit:"Free breakfast for students", tags:["student","Tamil Nadu","nutrition"], states:["tamil nadu"] },
  { id:"karnataka-gruha",     name:"Karnataka Gruha Lakshmi", short:"Gruha Lakshmi",category:"Women & Child",  type:"state", benefit:"₹2,000/month for women", tags:["women","Karnataka","cash transfer"], states:["karnataka"] },
  { id:"delhi-ladli",         name:"Delhi Ladli Yojana",      short:"Ladli",       category:"Women & Child",   type:"state", benefit:"₹11,000 for girl child Delhi", tags:["girl child","Delhi","women"], states:["delhi"] },
  { id:"wb-lakshmir",         name:"Lakshmir Bhandar",        short:"Lakshmir Bhandar",category:"Women & Child",type:"state", benefit:"₹1,000/month for WB women", tags:["women","West Bengal","cash"], states:["west bengal"] },
];

export const CENTRAL_SCHEMES = SCHEMES.filter(s => s.type === "central");
export const STATE_SCHEMES   = SCHEMES.filter(s => s.type === "state");

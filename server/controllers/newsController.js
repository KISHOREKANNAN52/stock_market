// Mock news — swap for NewsAPI / Google News API in production
const NEWS = [
  { id: 1, title: 'RBI holds repo rate at 6.5%, signals accommodative stance', source: 'Economic Times', time: '2h ago', category: 'Macro', sentiment: 'neutral', url: '#' },
  { id: 2, title: 'Reliance Industries Q4 profit jumps 18% on strong retail push', source: 'Business Standard', time: '3h ago', category: 'Corporate', sentiment: 'positive', url: '#' },
  { id: 3, title: 'Nifty 50 surges past 24,000; IT and Banking stocks lead rally', source: 'Mint', time: '4h ago', category: 'Markets', sentiment: 'positive', url: '#' },
  { id: 4, title: 'FIIs turn net buyers in Indian equities; pour ₹8,000 Cr in April', source: 'Moneycontrol', time: '5h ago', category: 'Markets', sentiment: 'positive', url: '#' },
  { id: 5, title: 'TCS bags $2.5 bn deal from European insurance major', source: 'CNBC-TV18', time: '6h ago', category: 'Corporate', sentiment: 'positive', url: '#' },
  { id: 6, title: 'India CPI inflation eases to 4.9% in March; near RBI comfort zone', source: 'Reuters', time: '8h ago', category: 'Macro', sentiment: 'positive', url: '#' },
  { id: 7, title: 'Adani Group stocks under pressure amid renewed regulatory scrutiny', source: 'Bloomberg', time: '10h ago', category: 'Corporate', sentiment: 'negative', url: '#' },
  { id: 8, title: 'Auto sector Q4 volume growth muted; Maruti and Hero diverge', source: 'Economic Times', time: '12h ago', category: 'Sector', sentiment: 'neutral', url: '#' },
  { id: 9, title: 'SEBI tightens F&O norms: weekly expiry changes from May 2025', source: 'Moneycontrol', time: '14h ago', category: 'Regulatory', sentiment: 'neutral', url: '#' },
  { id: 10, title: 'Sun Pharma gets USFDA nod for generics; stock hits 52-week high', source: 'PTI', time: '1d ago', category: 'Corporate', sentiment: 'positive', url: '#' },
  { id: 11, title: 'Coal India raises coking coal prices by 5%; steel stocks rally', source: 'Business Standard', time: '1d ago', category: 'Commodity', sentiment: 'positive', url: '#' },
  { id: 12, title: 'HDFC Bank credit card growth moderates; NIM guidance unchanged', source: 'Mint', time: '1d ago', category: 'Corporate', sentiment: 'neutral', url: '#' }
];

const getNews = (req, res) => {
  const { symbol, category } = req.query;
  let filtered = NEWS;
  if (symbol) {
    filtered = filtered.filter(n => n.title.toLowerCase().includes(symbol.toLowerCase().substring(0, 5)));
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(n => n.category === category);
  }
  res.json(filtered);
};

module.exports = { getNews };

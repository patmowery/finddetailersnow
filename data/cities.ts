import type { City } from '@/types';

export const CITIES: City[] = [
  // California
  { id: 'c-la', name: 'Los Angeles', slug: 'los-angeles', state: 'California', state_code: 'CA', population: 3898747, lat: 34.0522, lng: -118.2437 },
  { id: 'c-sd', name: 'San Diego', slug: 'san-diego', state: 'California', state_code: 'CA', population: 1386932, lat: 32.7157, lng: -117.1611 },
  { id: 'c-sj', name: 'San Jose', slug: 'san-jose', state: 'California', state_code: 'CA', population: 1013240, lat: 37.3382, lng: -121.8863 },
  { id: 'c-sf', name: 'San Francisco', slug: 'san-francisco', state: 'California', state_code: 'CA', population: 873965, lat: 37.7749, lng: -122.4194 },
  { id: 'c-fre', name: 'Fresno', slug: 'fresno', state: 'California', state_code: 'CA', population: 542107, lat: 36.7378, lng: -119.7871 },
  { id: 'c-sac', name: 'Sacramento', slug: 'sacramento', state: 'California', state_code: 'CA', population: 524943, lat: 38.5816, lng: -121.4944 },
  { id: 'c-lr', name: 'Long Beach', slug: 'long-beach', state: 'California', state_code: 'CA', population: 466742, lat: 33.7701, lng: -118.1937 },
  { id: 'c-oak', name: 'Oakland', slug: 'oakland', state: 'California', state_code: 'CA', population: 440981, lat: 37.8044, lng: -122.2712 },
  { id: 'c-bak', name: 'Bakersfield', slug: 'bakersfield', state: 'California', state_code: 'CA', population: 403455, lat: 35.3733, lng: -119.0187 },
  { id: 'c-ana', name: 'Anaheim', slug: 'anaheim', state: 'California', state_code: 'CA', population: 336265, lat: 33.8366, lng: -117.9143 },

  // Texas
  { id: 'c-hou', name: 'Houston', slug: 'houston', state: 'Texas', state_code: 'TX', population: 2304580, lat: 29.7604, lng: -95.3698 },
  { id: 'c-san', name: 'San Antonio', slug: 'san-antonio', state: 'Texas', state_code: 'TX', population: 1434625, lat: 29.4241, lng: -98.4936 },
  { id: 'c-dal', name: 'Dallas', slug: 'dallas', state: 'Texas', state_code: 'TX', population: 1304379, lat: 32.7767, lng: -96.7970 },
  { id: 'c-aus', name: 'Austin', slug: 'austin', state: 'Texas', state_code: 'TX', population: 978908, lat: 30.2672, lng: -97.7431 },
  { id: 'c-ftw', name: 'Fort Worth', slug: 'fort-worth', state: 'Texas', state_code: 'TX', population: 918915, lat: 32.7555, lng: -97.3308 },
  { id: 'c-elp', name: 'El Paso', slug: 'el-paso', state: 'Texas', state_code: 'TX', population: 678815, lat: 31.7619, lng: -106.4850 },
  { id: 'c-arli', name: 'Arlington', slug: 'arlington', state: 'Texas', state_code: 'TX', population: 394266, lat: 32.7357, lng: -97.1081 },
  { id: 'c-corp', name: 'Corpus Christi', slug: 'corpus-christi', state: 'Texas', state_code: 'TX', population: 316381, lat: 27.8006, lng: -97.3964 },

  // Florida
  { id: 'c-jax', name: 'Jacksonville', slug: 'jacksonville', state: 'Florida', state_code: 'FL', population: 949611, lat: 30.3322, lng: -81.6557 },
  { id: 'c-mia', name: 'Miami', slug: 'miami', state: 'Florida', state_code: 'FL', population: 467963, lat: 25.7617, lng: -80.1918 },
  { id: 'c-tam', name: 'Tampa', slug: 'tampa', state: 'Florida', state_code: 'FL', population: 399700, lat: 27.9506, lng: -82.4572 },
  { id: 'c-orl', name: 'Orlando', slug: 'orlando', state: 'Florida', state_code: 'FL', population: 307573, lat: 28.5383, lng: -81.3792 },
  { id: 'c-stpete', name: 'St. Petersburg', slug: 'st-petersburg', state: 'Florida', state_code: 'FL', population: 265351, lat: 27.7676, lng: -82.6403 },
  { id: 'c-hia', name: 'Hialeah', slug: 'hialeah', state: 'Florida', state_code: 'FL', population: 224669, lat: 25.8576, lng: -80.2781 },
  { id: 'c-ftl', name: 'Fort Lauderdale', slug: 'fort-lauderdale', state: 'Florida', state_code: 'FL', population: 185494, lat: 26.1224, lng: -80.1373 },

  // New York
  { id: 'c-nyc', name: 'New York', slug: 'new-york', state: 'New York', state_code: 'NY', population: 8336817, lat: 40.7128, lng: -74.0060 },
  { id: 'c-buf', name: 'Buffalo', slug: 'buffalo', state: 'New York', state_code: 'NY', population: 278349, lat: 42.8864, lng: -78.8784 },
  { id: 'c-roc', name: 'Rochester', slug: 'rochester', state: 'New York', state_code: 'NY', population: 206284, lat: 43.1566, lng: -77.6088 },
  { id: 'c-yok', name: 'Yonkers', slug: 'yonkers', state: 'New York', state_code: 'NY', population: 211569, lat: 40.9312, lng: -73.8988 },

  // Illinois
  { id: 'c-chi', name: 'Chicago', slug: 'chicago', state: 'Illinois', state_code: 'IL', population: 2696555, lat: 41.8781, lng: -87.6298 },
  { id: 'c-aur', name: 'Aurora', slug: 'aurora', state: 'Illinois', state_code: 'IL', population: 200965, lat: 41.7606, lng: -88.3201 },
  { id: 'c-jol', name: 'Joliet', slug: 'joliet', state: 'Illinois', state_code: 'IL', population: 150362, lat: 41.5250, lng: -88.0817 },

  // Pennsylvania
  { id: 'c-phi', name: 'Philadelphia', slug: 'philadelphia', state: 'Pennsylvania', state_code: 'PA', population: 1584138, lat: 39.9526, lng: -75.1652 },
  { id: 'c-pit', name: 'Pittsburgh', slug: 'pittsburgh', state: 'Pennsylvania', state_code: 'PA', population: 302971, lat: 40.4406, lng: -79.9959 },
  { id: 'c-all', name: 'Allentown', slug: 'allentown', state: 'Pennsylvania', state_code: 'PA', population: 125845, lat: 40.6084, lng: -75.4902 },

  // Arizona
  { id: 'c-pho', name: 'Phoenix', slug: 'phoenix', state: 'Arizona', state_code: 'AZ', population: 1608139, lat: 33.4484, lng: -112.0740 },
  { id: 'c-tuc', name: 'Tucson', slug: 'tucson', state: 'Arizona', state_code: 'AZ', population: 542629, lat: 32.2226, lng: -110.9747 },
  { id: 'c-mes', name: 'Mesa', slug: 'mesa', state: 'Arizona', state_code: 'AZ', population: 504258, lat: 33.4152, lng: -111.8315 },
  { id: 'c-chnd', name: 'Chandler', slug: 'chandler', state: 'Arizona', state_code: 'AZ', population: 275987, lat: 33.3062, lng: -111.8413 },
  { id: 'c-scot', name: 'Scottsdale', slug: 'scottsdale', state: 'Arizona', state_code: 'AZ', population: 258069, lat: 33.4942, lng: -111.9261 },

  // Georgia
  { id: 'c-atl', name: 'Atlanta', slug: 'atlanta', state: 'Georgia', state_code: 'GA', population: 498715, lat: 33.7490, lng: -84.3880 },
  { id: 'c-col', name: 'Columbus', slug: 'columbus', state: 'Georgia', state_code: 'GA', population: 206922, lat: 32.4610, lng: -84.9877 },
  { id: 'c-sav', name: 'Savannah', slug: 'savannah', state: 'Georgia', state_code: 'GA', population: 147780, lat: 32.0809, lng: -81.0912 },

  // North Carolina
  { id: 'c-char', name: 'Charlotte', slug: 'charlotte', state: 'North Carolina', state_code: 'NC', population: 874579, lat: 35.2271, lng: -80.8431 },
  { id: 'c-ral', name: 'Raleigh', slug: 'raleigh', state: 'North Carolina', state_code: 'NC', population: 467665, lat: 35.7796, lng: -78.6382 },
  { id: 'c-gre', name: 'Greensboro', slug: 'greensboro', state: 'North Carolina', state_code: 'NC', population: 296710, lat: 36.0726, lng: -79.7920 },
  { id: 'c-dur', name: 'Durham', slug: 'durham', state: 'North Carolina', state_code: 'NC', population: 278993, lat: 35.9940, lng: -78.8986 },

  // Washington
  { id: 'c-sea', name: 'Seattle', slug: 'seattle', state: 'Washington', state_code: 'WA', population: 737255, lat: 47.6062, lng: -122.3321 },
  { id: 'c-spo', name: 'Spokane', slug: 'spokane', state: 'Washington', state_code: 'WA', population: 222081, lat: 47.6588, lng: -117.4260 },
  { id: 'c-tac', name: 'Tacoma', slug: 'tacoma', state: 'Washington', state_code: 'WA', population: 219346, lat: 47.2529, lng: -122.4443 },

  // Tennessee
  { id: 'c-nas', name: 'Nashville', slug: 'nashville', state: 'Tennessee', state_code: 'TN', population: 689447, lat: 36.1627, lng: -86.7816 },
  { id: 'c-mem', name: 'Memphis', slug: 'memphis', state: 'Tennessee', state_code: 'TN', population: 633104, lat: 35.1495, lng: -90.0490 },
  { id: 'c-kno', name: 'Knoxville', slug: 'knoxville', state: 'Tennessee', state_code: 'TN', population: 190740, lat: 35.9606, lng: -83.9207 },

  // Ohio
  { id: 'c-col-oh', name: 'Columbus', slug: 'columbus', state: 'Ohio', state_code: 'OH', population: 905748, lat: 39.9612, lng: -82.9988 },
  { id: 'c-cle', name: 'Cleveland', slug: 'cleveland', state: 'Ohio', state_code: 'OH', population: 381009, lat: 41.4993, lng: -81.6944 },
  { id: 'c-cin', name: 'Cincinnati', slug: 'cincinnati', state: 'Ohio', state_code: 'OH', population: 309317, lat: 39.1031, lng: -84.5120 },
  { id: 'c-tol', name: 'Toledo', slug: 'toledo', state: 'Ohio', state_code: 'OH', population: 270871, lat: 41.6639, lng: -83.5552 },

  // Michigan
  { id: 'c-det', name: 'Detroit', slug: 'detroit', state: 'Michigan', state_code: 'MI', population: 639111, lat: 42.3314, lng: -83.0458 },
  { id: 'c-gra', name: 'Grand Rapids', slug: 'grand-rapids', state: 'Michigan', state_code: 'MI', population: 198917, lat: 42.9634, lng: -85.6681 },
  { id: 'c-war', name: 'Warren', slug: 'warren', state: 'Michigan', state_code: 'MI', population: 135358, lat: 42.5145, lng: -83.0146 },

  // Nevada
  { id: 'c-lv', name: 'Las Vegas', slug: 'las-vegas', state: 'Nevada', state_code: 'NV', population: 641903, lat: 36.1699, lng: -115.1398 },
  { id: 'c-hen', name: 'Henderson', slug: 'henderson', state: 'Nevada', state_code: 'NV', population: 320189, lat: 36.0395, lng: -114.9817 },
  { id: 'c-ren', name: 'Reno', slug: 'reno', state: 'Nevada', state_code: 'NV', population: 264165, lat: 39.5296, lng: -119.8138 },

  // Colorado
  { id: 'c-den', name: 'Denver', slug: 'denver', state: 'Colorado', state_code: 'CO', population: 715522, lat: 39.7392, lng: -104.9903 },
  { id: 'c-csp', name: 'Colorado Springs', slug: 'colorado-springs', state: 'Colorado', state_code: 'CO', population: 478961, lat: 38.8339, lng: -104.8214 },
  { id: 'c-aur-co', name: 'Aurora', slug: 'aurora', state: 'Colorado', state_code: 'CO', population: 386261, lat: 39.7294, lng: -104.8319 },

  // Massachusetts
  { id: 'c-bos', name: 'Boston', slug: 'boston', state: 'Massachusetts', state_code: 'MA', population: 675647, lat: 42.3601, lng: -71.0589 },
  { id: 'c-wor', name: 'Worcester', slug: 'worcester', state: 'Massachusetts', state_code: 'MA', population: 206518, lat: 42.2626, lng: -71.8023 },
  { id: 'c-spr-ma', name: 'Springfield', slug: 'springfield', state: 'Massachusetts', state_code: 'MA', population: 153606, lat: 42.1015, lng: -72.5898 },

  // Indiana
  { id: 'c-ind', name: 'Indianapolis', slug: 'indianapolis', state: 'Indiana', state_code: 'IN', population: 887642, lat: 39.7684, lng: -86.1581 },
  { id: 'c-ftwayne', name: 'Fort Wayne', slug: 'fort-wayne', state: 'Indiana', state_code: 'IN', population: 270402, lat: 41.1306, lng: -85.1289 },

  // Minnesota
  { id: 'c-min', name: 'Minneapolis', slug: 'minneapolis', state: 'Minnesota', state_code: 'MN', population: 429954, lat: 44.9778, lng: -93.2650 },
  { id: 'c-stpaul', name: 'Saint Paul', slug: 'saint-paul', state: 'Minnesota', state_code: 'MN', population: 311527, lat: 44.9537, lng: -93.0900 },

  // Missouri
  { id: 'c-kc', name: 'Kansas City', slug: 'kansas-city', state: 'Missouri', state_code: 'MO', population: 508090, lat: 39.0997, lng: -94.5786 },
  { id: 'c-stl', name: 'St. Louis', slug: 'st-louis', state: 'Missouri', state_code: 'MO', population: 301578, lat: 38.6270, lng: -90.1994 },
  { id: 'c-spr-mo', name: 'Springfield', slug: 'springfield', state: 'Missouri', state_code: 'MO', population: 169176, lat: 37.2153, lng: -93.2982 },

  // Maryland
  { id: 'c-bal', name: 'Baltimore', slug: 'baltimore', state: 'Maryland', state_code: 'MD', population: 585708, lat: 39.2904, lng: -76.6122 },

  // Wisconsin
  { id: 'c-mil', name: 'Milwaukee', slug: 'milwaukee', state: 'Wisconsin', state_code: 'WI', population: 577222, lat: 43.0389, lng: -87.9065 },
  { id: 'c-mad', name: 'Madison', slug: 'madison', state: 'Wisconsin', state_code: 'WI', population: 269840, lat: 43.0731, lng: -89.4012 },

  // Oklahoma
  { id: 'c-okc', name: 'Oklahoma City', slug: 'oklahoma-city', state: 'Oklahoma', state_code: 'OK', population: 681054, lat: 35.4676, lng: -97.5164 },
  { id: 'c-tul', name: 'Tulsa', slug: 'tulsa', state: 'Oklahoma', state_code: 'OK', population: 413066, lat: 36.1540, lng: -95.9928 },

  // Virginia
  { id: 'c-vab', name: 'Virginia Beach', slug: 'virginia-beach', state: 'Virginia', state_code: 'VA', population: 459470, lat: 36.8529, lng: -75.9780 },
  { id: 'c-nor', name: 'Norfolk', slug: 'norfolk', state: 'Virginia', state_code: 'VA', population: 238005, lat: 36.8508, lng: -76.2859 },
  { id: 'c-ric', name: 'Richmond', slug: 'richmond', state: 'Virginia', state_code: 'VA', population: 230436, lat: 37.5407, lng: -77.4360 },

  // Louisiana
  { id: 'c-nola', name: 'New Orleans', slug: 'new-orleans', state: 'Louisiana', state_code: 'LA', population: 383997, lat: 29.9511, lng: -90.0715 },
  { id: 'c-bat', name: 'Baton Rouge', slug: 'baton-rouge', state: 'Louisiana', state_code: 'LA', population: 224963, lat: 30.4515, lng: -91.1871 },

  // Kentucky
  { id: 'c-lou', name: 'Louisville', slug: 'louisville', state: 'Kentucky', state_code: 'KY', population: 633045, lat: 38.2527, lng: -85.7585 },
  { id: 'c-lex', name: 'Lexington', slug: 'lexington', state: 'Kentucky', state_code: 'KY', population: 322570, lat: 38.0406, lng: -84.5037 },

  // Oregon
  { id: 'c-por', name: 'Portland', slug: 'portland', state: 'Oregon', state_code: 'OR', population: 652503, lat: 45.5051, lng: -122.6750 },
  { id: 'c-eug', name: 'Eugene', slug: 'eugene', state: 'Oregon', state_code: 'OR', population: 176654, lat: 44.0521, lng: -123.0868 },

  // South Carolina
  { id: 'c-col-sc', name: 'Columbia', slug: 'columbia', state: 'South Carolina', state_code: 'SC', population: 136632, lat: 34.0007, lng: -81.0348 },
  { id: 'c-chs', name: 'Charleston', slug: 'charleston', state: 'South Carolina', state_code: 'SC', population: 150227, lat: 32.7765, lng: -79.9311 },

  // Alabama
  { id: 'c-bir', name: 'Birmingham', slug: 'birmingham', state: 'Alabama', state_code: 'AL', population: 212237, lat: 33.5186, lng: -86.8104 },
  { id: 'c-mon', name: 'Montgomery', slug: 'montgomery', state: 'Alabama', state_code: 'AL', population: 199518, lat: 32.3792, lng: -86.3077 },

  // New Jersey
  { id: 'c-new', name: 'Newark', slug: 'newark', state: 'New Jersey', state_code: 'NJ', population: 282011, lat: 40.7357, lng: -74.1724 },
  { id: 'c-jer', name: 'Jersey City', slug: 'jersey-city', state: 'New Jersey', state_code: 'NJ', population: 292449, lat: 40.7178, lng: -74.0431 },

  // Connecticut
  { id: 'c-brg', name: 'Bridgeport', slug: 'bridgeport', state: 'Connecticut', state_code: 'CT', population: 148654, lat: 41.1865, lng: -73.1952 },
  { id: 'c-htf', name: 'Hartford', slug: 'hartford', state: 'Connecticut', state_code: 'CT', population: 121054, lat: 41.7658, lng: -72.6851 },

  // Iowa
  { id: 'c-des', name: 'Des Moines', slug: 'des-moines', state: 'Iowa', state_code: 'IA', population: 214237, lat: 41.5868, lng: -93.6250 },

  // Arkansas
  { id: 'c-lrk', name: 'Little Rock', slug: 'little-rock', state: 'Arkansas', state_code: 'AR', population: 202591, lat: 34.7465, lng: -92.2896 },

  // Utah
  { id: 'c-slc', name: 'Salt Lake City', slug: 'salt-lake-city', state: 'Utah', state_code: 'UT', population: 200567, lat: 40.7608, lng: -111.8910 },
  { id: 'c-wvl', name: 'West Valley City', slug: 'west-valley-city', state: 'Utah', state_code: 'UT', population: 140230, lat: 40.6916, lng: -112.0011 },

  // Kansas
  { id: 'c-wic', name: 'Wichita', slug: 'wichita', state: 'Kansas', state_code: 'KS', population: 397532, lat: 37.6872, lng: -97.3301 },

  // Mississippi
  { id: 'c-jac', name: 'Jackson', slug: 'jackson', state: 'Mississippi', state_code: 'MS', population: 153701, lat: 32.2988, lng: -90.1848 },

  // Nebraska
  { id: 'c-oma', name: 'Omaha', slug: 'omaha', state: 'Nebraska', state_code: 'NE', population: 486051, lat: 41.2565, lng: -95.9345 },

  // New Mexico
  { id: 'c-abq', name: 'Albuquerque', slug: 'albuquerque', state: 'New Mexico', state_code: 'NM', population: 564559, lat: 35.0844, lng: -106.6504 },

  // Hawaii
  { id: 'c-hon', name: 'Honolulu', slug: 'honolulu', state: 'Hawaii', state_code: 'HI', population: 347884, lat: 21.3069, lng: -157.8583 },

  // Idaho
  { id: 'c-boi', name: 'Boise', slug: 'boise', state: 'Idaho', state_code: 'ID', population: 235684, lat: 43.6150, lng: -116.2023 },

  // Montana
  { id: 'c-bil', name: 'Billings', slug: 'billings', state: 'Montana', state_code: 'MT', population: 109577, lat: 45.7833, lng: -108.5007 },

  // Alaska
  { id: 'c-anc', name: 'Anchorage', slug: 'anchorage', state: 'Alaska', state_code: 'AK', population: 291538, lat: 61.2181, lng: -149.9003 },

  // Rhode Island
  { id: 'c-pro', name: 'Providence', slug: 'providence', state: 'Rhode Island', state_code: 'RI', population: 180393, lat: 41.8240, lng: -71.4128 },

  // West Virginia
  { id: 'c-cha-wv', name: 'Charleston', slug: 'charleston', state: 'West Virginia', state_code: 'WV', population: 46536, lat: 38.3498, lng: -81.6326 },

  // Delaware
  { id: 'c-wil', name: 'Wilmington', slug: 'wilmington', state: 'Delaware', state_code: 'DE', population: 70635, lat: 39.7447, lng: -75.5484 },

  // Vermont
  { id: 'c-bur', name: 'Burlington', slug: 'burlington', state: 'Vermont', state_code: 'VT', population: 45012, lat: 44.4759, lng: -73.2121 },

  // Wyoming
  { id: 'c-che', name: 'Cheyenne', slug: 'cheyenne', state: 'Wyoming', state_code: 'WY', population: 65132, lat: 41.1400, lng: -104.8202 },

  // North Dakota
  { id: 'c-far', name: 'Fargo', slug: 'fargo', state: 'North Dakota', state_code: 'ND', population: 125990, lat: 46.8772, lng: -96.7898 },

  // South Dakota
  { id: 'c-sui', name: 'Sioux Falls', slug: 'sioux-falls', state: 'South Dakota', state_code: 'SD', population: 192517, lat: 43.5446, lng: -96.7311 },

  // Maine
  { id: 'c-por-me', name: 'Portland', slug: 'portland', state: 'Maine', state_code: 'ME', population: 68408, lat: 43.6591, lng: -70.2568 },

  // New Hampshire
  { id: 'c-man', name: 'Manchester', slug: 'manchester', state: 'New Hampshire', state_code: 'NH', population: 115644, lat: 42.9956, lng: -71.4548 },

  // Additional large metros
  { id: 'c-stk', name: 'Stockton', slug: 'stockton', state: 'California', state_code: 'CA', population: 320804, lat: 37.9577, lng: -121.2908 },
  { id: 'c-riv', name: 'Riverside', slug: 'riverside', state: 'California', state_code: 'CA', population: 314998, lat: 33.9533, lng: -117.3962 },
  { id: 'c-sb', name: 'Santa Ana', slug: 'santa-ana', state: 'California', state_code: 'CA', population: 310227, lat: 33.7455, lng: -117.8677 },
  { id: 'c-cor', name: 'Corona', slug: 'corona', state: 'California', state_code: 'CA', population: 168019, lat: 33.8753, lng: -117.5664 },
  { id: 'c-chu', name: 'Chula Vista', slug: 'chula-vista', state: 'California', state_code: 'CA', population: 275487, lat: 32.6401, lng: -117.0842 },
  { id: 'c-irv', name: 'Irvine', slug: 'irvine', state: 'California', state_code: 'CA', population: 307670, lat: 33.6846, lng: -117.8265 },
  { id: 'c-mod', name: 'Modesto', slug: 'modesto', state: 'California', state_code: 'CA', population: 218464, lat: 37.6391, lng: -120.9969 },

  { id: 'c-plano', name: 'Plano', slug: 'plano', state: 'Texas', state_code: 'TX', population: 285494, lat: 33.0198, lng: -96.6989 },
  { id: 'c-laredo', name: 'Laredo', slug: 'laredo', state: 'Texas', state_code: 'TX', population: 262491, lat: 27.5306, lng: -99.4803 },
  { id: 'c-irving', name: 'Irving', slug: 'irving', state: 'Texas', state_code: 'TX', population: 256684, lat: 32.8140, lng: -96.9489 },
  { id: 'c-garland', name: 'Garland', slug: 'garland', state: 'Texas', state_code: 'TX', population: 246018, lat: 32.9126, lng: -96.6389 },

  { id: 'c-pen', name: 'Pembroke Pines', slug: 'pembroke-pines', state: 'Florida', state_code: 'FL', population: 173591, lat: 26.0075, lng: -80.2963 },
  { id: 'c-cape', name: 'Cape Coral', slug: 'cape-coral', state: 'Florida', state_code: 'FL', population: 194016, lat: 26.5629, lng: -81.9495 },
  { id: 'c-tally', name: 'Tallahassee', slug: 'tallahassee', state: 'Florida', state_code: 'FL', population: 196169, lat: 30.4518, lng: -84.2807 },

  { id: 'c-henderson-nv', name: 'Henderson', slug: 'henderson', state: 'Nevada', state_code: 'NV', population: 320189, lat: 36.0395, lng: -114.9817 },

  { id: 'c-tempe', name: 'Tempe', slug: 'tempe', state: 'Arizona', state_code: 'AZ', population: 195805, lat: 33.4255, lng: -111.9400 },
  { id: 'c-gilbert', name: 'Gilbert', slug: 'gilbert', state: 'Arizona', state_code: 'AZ', population: 267918, lat: 33.3528, lng: -111.7890 },
  { id: 'c-glendale-az', name: 'Glendale', slug: 'glendale', state: 'Arizona', state_code: 'AZ', population: 252381, lat: 33.5387, lng: -112.1860 },

  { id: 'c-raleigh-nc', name: 'Cary', slug: 'cary', state: 'North Carolina', state_code: 'NC', population: 175782, lat: 35.7915, lng: -78.7811 },

  { id: 'c-denton', name: 'Denton', slug: 'denton', state: 'Texas', state_code: 'TX', population: 187063, lat: 33.2148, lng: -97.1331 },
  { id: 'c-mcallen', name: 'McAllen', slug: 'mcallen', state: 'Texas', state_code: 'TX', population: 142212, lat: 26.2034, lng: -98.2300 },

  { id: 'c-baton-rouge', name: 'Shreveport', slug: 'shreveport', state: 'Louisiana', state_code: 'LA', population: 187593, lat: 32.5252, lng: -93.7502 },

  { id: 'c-mesa-az', name: 'Peoria', slug: 'peoria', state: 'Arizona', state_code: 'AZ', population: 190985, lat: 33.5806, lng: -112.2374 },

  { id: 'c-akron', name: 'Akron', slug: 'akron', state: 'Ohio', state_code: 'OH', population: 190469, lat: 41.0814, lng: -81.5190 },

  { id: 'c-aurora-co', name: 'Lakewood', slug: 'lakewood', state: 'Colorado', state_code: 'CO', population: 160065, lat: 39.7047, lng: -105.0814 },

  { id: 'c-winstonsalem', name: 'Winston-Salem', slug: 'winston-salem', state: 'North Carolina', state_code: 'NC', population: 249545, lat: 36.0999, lng: -80.2442 },

  { id: 'c-stlouis-mo', name: 'St. Charles', slug: 'st-charles', state: 'Missouri', state_code: 'MO', population: 70379, lat: 38.7881, lng: -90.4974 },

  { id: 'c-knoxville-tn', name: 'Chattanooga', slug: 'chattanooga', state: 'Tennessee', state_code: 'TN', population: 181099, lat: 35.0456, lng: -85.3097 },

  { id: 'c-charleston-wv', name: 'Huntington', slug: 'huntington', state: 'West Virginia', state_code: 'WV', population: 43760, lat: 38.4193, lng: -82.4452 },

  { id: 'c-sanmarcos', name: 'San Marcos', slug: 'san-marcos', state: 'Texas', state_code: 'TX', population: 67553, lat: 29.8827, lng: -97.9411 },

  { id: 'c-savannah-ga', name: 'Augusta', slug: 'augusta', state: 'Georgia', state_code: 'GA', population: 202081, lat: 33.4735, lng: -82.0105 },

  { id: 'c-syracuse', name: 'Syracuse', slug: 'syracuse', state: 'New York', state_code: 'NY', population: 148620, lat: 43.0481, lng: -76.1474 },
];

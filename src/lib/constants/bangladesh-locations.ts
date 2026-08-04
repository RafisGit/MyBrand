// Bangladesh Administrative Locations Dataset

export interface DivisionData {
  name: string;
  districts: {
    name: string;
    upazilas: string[];
  }[];
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    name: "Dhaka",
    districts: [
      {
        name: "Dhaka",
        upazilas: [
          "Dhanmondi",
          "Gulshan",
          "Banani",
          "Uttara",
          "Mirpur",
          "Tejgaon",
          "Ramna",
          "Mohammadpur",
          "Motijheel",
          "Badda",
          "Khilkhet",
          "Pallabi",
          "Shahbagh",
          "Lalbagh",
          "Jatrabari",
          "Demra",
          "Khilgaon",
          "Kafrul",
          "Hazaribagh",
          "Kamrangirchar",
          "Cantonment",
          "Savar",
          "Dhamrai",
          "Keraniganj",
          "Nawabganj",
          "Dohar",
        ],
      },
      {
        name: "Gazipur",
        upazilas: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Sreepur", "Kapasia"],
      },
      {
        name: "Narayanganj",
        upazilas: ["Narayanganj Sadar", "Araihazar", "Bandar", "Roopganj", "Sonargaon"],
      },
      {
        name: "Manikganj",
        upazilas: ["Manikganj Sadar", "Singair", "Saturia", "Shivalaya", "Harirampur", "Ghior", "Daulatpur"],
      },
      {
        name: "Munshiganj",
        upazilas: ["Munshiganj Sadar", "Gazaria", "Tongibari", "Sreenagar", "Lohajang", "Sirajdikhan"],
      },
      {
        name: "Narsingdi",
        upazilas: ["Narsingdi Sadar", "Palash", "Shibpur", "Belabo", "Monohardi", "Raipura"],
      },
      {
        name: "Tangail",
        upazilas: ["Tangail Sadar", "Mirzapur", "Kalihati", "Ghatail", "Sakhipur", "Basail", "Delduar", "Dhanbari", "Madhupur", "Bhuapur", "Gopalpur"],
      },
      {
        name: "Faridpur",
        upazilas: ["Faridpur Sadar", "Bhanga", "Boalmari", "Charbhadrasan", "Alfadanga", "Madhukhali", "Nagarkanda", "Sadarpur"],
      },
      {
        name: "Madaripur",
        upazilas: ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"],
      },
      {
        name: "Rajbari",
        upazilas: ["Rajbari Sadar", "Baliakandi", "Goalandaghat", "Pangsha", "Kalukhali"],
      },
      {
        name: "Shariatpur",
        upazilas: ["Shariatpur Sadar", "Damudya", "Naria", "Zajira", "Bhedarganj", "Gosairhat"],
      },
      {
        name: "Gopalganj",
        upazilas: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
      },
    ],
  },
  {
    name: "Chattogram",
    districts: [
      {
        name: "Chattogram",
        upazilas: [
          "Kotwali",
          "Panchlaish",
          "Double Mooring",
          "Halishahar",
          "Chittagong Sadar",
          "Hathazari",
          "Sitakunda",
          "Mirsarai",
          "Patiya",
          "Boalkhali",
          "Anwara",
          "Banshkhali",
          "Chandanaish",
          "Fatikchhari",
          "Raozan",
          "Rangunia",
          "Lohagara",
          "Satkania",
        ],
      },
      {
        name: "Cox's Bazar",
        upazilas: ["Cox's Bazar Sadar", "Chakaria", "Teknaf", "Ukhiya", "Maheshkhali", "Pekua", "Ramu", "Kutubdia"],
      },
      {
        name: "Cumilla",
        upazilas: ["Cumilla Sadar", "Cumilla Sadar Dakshin", "Daudkandi", "Chandina", "Debidwar", "Muradnagar", "Barura", "Brahmanpara", "Burichang", "Chauddagram", "Homna", "Laksam", "Meghna", "Monohargonj", "Nangalkot", "Titas"],
      },
      {
        name: "Feni",
        upazilas: ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Fulgazi", "Sonavazi"],
      },
      {
        name: "Noakhali",
        upazilas: ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Senbagh", "Subarnachar", "Kabirhat", "Sonaimuri"],
      },
      {
        name: "Lakshmipur",
        upazilas: ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"],
      },
      {
        name: "Brahmanbaria",
        upazilas: ["Brahmanbaria Sadar", "Ashuganj", "Bancharampur", "Kasba", "Nabinagar", "Nasirnagar", "Sarail", "Akhaura"],
      },
      {
        name: "Chandpur",
        upazilas: ["Chandpur Sadar", "Faridganj", "Haimchar", "Hajiganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"],
      },
      {
        name: "Rangamati",
        upazilas: ["Rangamati Sadar", "Belaichhari", "Barki", "Kaptai", "Kawkhali", "Langadu", "Nanichar", "Rajasthali"],
      },
      {
        name: "Khagrachhari",
        upazilas: ["Khagrachhari Sadar", "Dighinala", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"],
      },
      {
        name: "Bandarban",
        upazilas: ["Bandarban Sadar", "Ali Kadam", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"],
      },
    ],
  },
  {
    name: "Khulna",
    districts: [
      {
        name: "Khulna",
        upazilas: [
          "Khulna Sadar",
          "Sonadanga",
          "Boyra",
          "Daulatpur",
          "Khalishpur",
          "Khan Jahan Ali",
          "Batiaghata",
          "Dacope",
          "Dumuria",
          "Dighalia",
          "Koyra",
          "Paikgachha",
          "Phultala",
          "Rupsha",
          "Terokhada",
        ],
      },
      {
        name: "Jashore",
        upazilas: ["Jashore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
      },
      {
        name: "Bagerhat",
        upazilas: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
      },
      {
        name: "Satkhira",
        upazilas: ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"],
      },
      {
        name: "Kushtia",
        upazilas: ["Kushtia Sadar", "Kumarkhali", "Daulatpur", "Mirpur", "Bheramara", "Khoksa"],
      },
      {
        name: "Meherpur",
        upazilas: ["Meherpur Sadar", "Gangni", "Mujibnagar"],
      },
      {
        name: "Chuadanga",
        upazilas: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
      },
      {
        name: "Jhenaidah",
        upazilas: ["Jhenaidah Sadar", "Harinakunda", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
      },
      {
        name: "Magura",
        upazilas: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
      },
      {
        name: "Narail",
        upazilas: ["Narail Sadar", "Kalia", "Lohagara"],
      },
    ],
  },
  {
    name: "Rajshahi",
    districts: [
      {
        name: "Rajshahi",
        upazilas: [
          "Boalia",
          "Rajpara",
          "Motihar",
          "Shah Makhdum",
          "Paba",
          "Bagha",
          "Bagmara",
          "Charghat",
          "Durgapur",
          "Godagari",
          "Mohanpur",
          "Puthia",
          "Tanore",
        ],
      },
      {
        name: "Bogura",
        upazilas: [
          "Bogura Sadar",
          "Adamdighi",
          "Dhunat",
          "Dupchanchia",
          "Gabtali",
          "Kahaloo",
          "Nandigram",
          "Sariakandi",
          "Shajahanpur",
          "Sherpur",
          "Shibganj",
        ],
      },
      {
        name: "Pabna",
        upazilas: ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"],
      },
      {
        name: "Sirajganj",
        upazilas: ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Rayganj", "Shahjadpur", "Tarash", "Ullahpara"],
      },
      {
        name: "Natore",
        upazilas: ["Natore Sadar", "Baraigram", "Gurudaspur", "Lalpur", "Naldanga", "Singra"],
      },
      {
        name: "Naogaon",
        upazilas: ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar", "Mohadevpur"],
      },
      {
        name: "Chapainawabganj",
        upazilas: ["Chapainawabganj Sadar", "Bholahat", "Gomastapur", "Nachole", "Shibganj"],
      },
      {
        name: "Joypurhat",
        upazilas: ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"],
      },
    ],
  },
  {
    name: "Barishal",
    districts: [
      {
        name: "Barishal",
        upazilas: [
          "Barishal Sadar",
          "Agailjhara",
          "Babuganj",
          "Bakerganj",
          "Banaripara",
          "Gaurnadi",
          "Hizla",
          "Mehendiganj",
          "Muladi",
          "Wazirpur",
        ],
      },
      {
        name: "Bhola",
        upazilas: ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
      },
      {
        name: "Jhalokathi",
        upazilas: ["Jhalokathi Sadar", "Kathalia", "Nalchity", "Rajapur"],
      },
      {
        name: "Pirojpur",
        upazilas: ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Zianagar"],
      },
      {
        name: "Barguna",
        upazilas: ["Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata", "Taltali"],
      },
      {
        name: "Patuakhali",
        upazilas: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali", "Dumki"],
      },
    ],
  },
  {
    name: "Sylhet",
    districts: [
      {
        name: "Sylhet",
        upazilas: [
          "Sylhet Sadar",
          "Beanibazar",
          "Bishwanath",
          "Companiganj",
          "Fenchuganj",
          "Golapganj",
          "Gowainghat",
          "Jaintiapur",
          "Kanaighat",
          "Osmani Nagar",
          "South Surma",
          "Zakiganj",
        ],
      },
      {
        name: "Moulvibazar",
        upazilas: ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"],
      },
      {
        name: "Habiganj",
        upazilas: ["Habiganj Sadar", "Ajmiriganj", "Baniyachong", "Bahubal", "Chhatak", "Chunarughat", "Madhabpur", "Nabiganj"],
      },
      {
        name: "Sunamganj",
        upazilas: ["Sunamganj Sadar", "Bishwamambharpur", "Chhatak", "Derai", "Dharamapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Shalla", "Tahirpur"],
      },
    ],
  },
  {
    name: "Rangpur",
    districts: [
      {
        name: "Rangpur",
        upazilas: ["Rangpur Sadar", "Badarganj", "Gangachhara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"],
      },
      {
        name: "Dinajpur",
        upazilas: ["Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"],
      },
      {
        name: "Gaibandha",
        upazilas: ["Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"],
      },
      {
        name: "Kurigram",
        upazilas: ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Phulbari", "Nageshwari", "Rajarhat", "Raomari", "Ulipur"],
      },
      {
        name: "Lalmonirhat",
        upazilas: ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"],
      },
      {
        name: "Nilphamari",
        upazilas: ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur"],
      },
      {
        name: "Panchagarh",
        upazilas: ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"],
      },
      {
        name: "Thakurgaon",
        upazilas: ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"],
      },
    ],
  },
  {
    name: "Mymensingh",
    districts: [
      {
        name: "Mymensingh",
        upazilas: [
          "Mymensingh Sadar",
          "Bhaluka",
          "Trishal",
          "Muktagachha",
          "Gafargaon",
          "Phulpur",
          "Haluaghat",
          "Dhobaura",
          "Ishwarganj",
          "Nandail",
          "Phulbaria",
        ],
      },
      {
        name: "Jamalpur",
        upazilas: ["Jamalpur Sadar", "Baksiganj", "Dewanganj", "Isampur", "Madarganj", "Melandaha", "Sarishabari"],
      },
      {
        name: "Netrokona",
        upazilas: ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendal", "Madan", "Mohanganj", "Purbadhala"],
      },
      {
        name: "Sherpur",
        upazilas: ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"],
      },
    ],
  },
];

// Helper to get districts for a division
export function getDistrictsForDivision(divisionName: string): string[] {
  const div = BANGLADESH_DIVISIONS.find(
    (d) => d.name.toLowerCase() === divisionName.toLowerCase(),
  );
  return div ? div.districts.map((dst) => dst.name) : [];
}

// Helper to get upazilas for a district
export function getUpazilasForDistrict(
  divisionName: string,
  districtName: string,
): string[] {
  const div = BANGLADESH_DIVISIONS.find(
    (d) => d.name.toLowerCase() === divisionName.toLowerCase(),
  );
  if (!div) return [];

  const dst = div.districts.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase(),
  );
  return dst ? dst.upazilas : [];
}

// Helper to auto-fill postal code for common upazilas / areas
const POSTAL_CODE_MAP: Record<string, string> = {
  dhanmondi: "1209",
  gulshan: "1212",
  banani: "1213",
  uttara: "1230",
  mirpur: "1216",
  tejgaon: "1215",
  ramna: "1000",
  mohammadpur: "1207",
  motijheel: "1000",
  badda: "1212",
  khilkhet: "1229",
  pallabi: "1216",
  savar: "1340",
  keraniganj: "1310",
  "gazipur sadar": "1700",
  "narayanganj sadar": "1400",
  kotwali: "4000",
  panchlaish: "4000",
  "chittagong sadar": "4000",
  "sylhet sadar": "3100",
  boalia: "6000",
  "rajshahi sadar": "6000",
  "khulna sadar": "9100",
  "barishal sadar": "8200",
  "rangpur sadar": "5400",
  "mymensingh sadar": "2200",
  "bogura sadar": "5800",
  "cox's bazar sadar": "4700",
};

export function lookupPostalCode(upazilaName: string): string {
  const normalized = upazilaName.trim().toLowerCase();
  return POSTAL_CODE_MAP[normalized] ?? "1200";
}

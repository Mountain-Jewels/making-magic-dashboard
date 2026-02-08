export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' },
]

export const SAMPLE_COUNTIES: Record<string, { fips: string; name: string }[]> = {
  CA: [
    { fips: '06037', name: 'Los Angeles' }, { fips: '06073', name: 'San Diego' },
    { fips: '06075', name: 'San Francisco' }, { fips: '06059', name: 'Orange' },
    { fips: '06065', name: 'Riverside' }, { fips: '06071', name: 'San Bernardino' },
    { fips: '06085', name: 'Santa Clara' }, { fips: '06001', name: 'Alameda' },
  ],
  NY: [
    { fips: '36061', name: 'New York (Manhattan)' }, { fips: '36047', name: 'Kings (Brooklyn)' },
    { fips: '36081', name: 'Queens' }, { fips: '36005', name: 'Bronx' },
    { fips: '36085', name: 'Richmond (Staten Island)' }, { fips: '36119', name: 'Westchester' },
    { fips: '36103', name: 'Suffolk' }, { fips: '36059', name: 'Nassau' },
  ],
  FL: [
    { fips: '12086', name: 'Miami-Dade' }, { fips: '12011', name: 'Broward' },
    { fips: '12099', name: 'Palm Beach' }, { fips: '12057', name: 'Hillsborough' },
    { fips: '12095', name: 'Orange' }, { fips: '12031', name: 'Duval' },
  ],
  TX: [
    { fips: '48201', name: 'Harris' }, { fips: '48113', name: 'Dallas' },
    { fips: '48029', name: 'Bexar' }, { fips: '48439', name: 'Tarrant' },
    { fips: '48453', name: 'Travis' }, { fips: '48085', name: 'Collin' },
  ],
  MA: [
    { fips: '25025', name: 'Suffolk' }, { fips: '25017', name: 'Middlesex' },
    { fips: '25021', name: 'Norfolk' }, { fips: '25009', name: 'Essex' },
  ],
}

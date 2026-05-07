export default {
  name: 'shipping',
  title: 'Tarifs de Livraison',
  type: 'document',
  fields: [
    {
      name: 'defaultRates',
      title: 'Tarifs par défaut (S\'appliquent à toutes les wilayas non listées en dessous)',
      type: 'object',
      fields: [
        { name: 'desk', title: 'Prix Bureau / Point Relais (DZD)', type: 'number', initialValue: 400 },
        { name: 'home', title: 'Prix à Domicile (DZD)', type: 'number', initialValue: 600 }
      ]
    },
    {
      name: 'wilayaRates',
      title: 'Tarifs Spécifiques par Wilaya',
      description: 'Ajoutez ici les wilayas qui ont un prix différent du tarif par défaut.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'wilayaCode',
              title: 'Wilaya',
              type: 'string',
              options: {
                list: [
                  {title: '01 - Adrar', value: '01'}, {title: '02 - Chlef', value: '02'}, {title: '03 - Laghouat', value: '03'},
                  {title: '04 - Oum El Bouaghi', value: '04'}, {title: '05 - Batna', value: '05'}, {title: '06 - Béjaïa', value: '06'},
                  {title: '07 - Biskra', value: '07'}, {title: '08 - Béchar', value: '08'}, {title: '09 - Blida', value: '09'},
                  {title: '10 - Bouira', value: '10'}, {title: '11 - Tamanrasset', value: '11'}, {title: '12 - Tébessa', value: '12'},
                  {title: '13 - Tlemcen', value: '13'}, {title: '14 - Tiaret', value: '14'}, {title: '15 - Tizi Ouzou', value: '15'},
                  {title: '16 - Alger', value: '16'}, {title: '17 - Djelfa', value: '17'}, {title: '18 - Jijel', value: '18'},
                  {title: '19 - Sétif', value: '19'}, {title: '20 - Saïda', value: '20'}, {title: '21 - Skikda', value: '21'},
                  {title: '22 - Sidi Bel Abbès', value: '22'}, {title: '23 - Annaba', value: '23'}, {title: '24 - Guelma', value: '24'},
                  {title: '25 - Constantine', value: '25'}, {title: '26 - Médéa', value: '26'}, {title: '27 - Mostaganem', value: '27'},
                  {title: '28 - M\'Sila', value: '28'}, {title: '29 - Mascara', value: '29'}, {title: '30 - Ouargla', value: '30'},
                  {title: '31 - Oran', value: '31'}, {title: '32 - El Bayadh', value: '32'}, {title: '33 - Illizi', value: '33'},
                  {title: '34 - Bordj Bou Arreridj', value: '34'}, {title: '35 - Boumerdès', value: '35'}, {title: '36 - El Tarf', value: '36'},
                  {title: '37 - Tindouf', value: '37'}, {title: '38 - Tissemsilt', value: '38'}, {title: '39 - El Oued', value: '39'},
                  {title: '40 - Khenchela', value: '40'}, {title: '41 - Souk Ahras', value: '41'}, {title: '42 - Tipaza', value: '42'},
                  {title: '43 - Mila', value: '43'}, {title: '44 - Aïn Defla', value: '44'}, {title: '45 - Naâma', value: '45'},
                  {title: '46 - Aïn Témouchent', value: '46'}, {title: '47 - Ghardaïa', value: '47'}, {title: '48 - Relizane', value: '48'},
                  {title: '49 - Timimoun', value: '49'}, {title: '50 - Bordj Badji Mokhtar', value: '50'}, {title: '51 - Ouled Djellal', value: '51'},
                  {title: '52 - Béni Abbès', value: '52'}, {title: '53 - In Salah', value: '53'}, {title: '54 - In Guezzam', value: '54'},
                  {title: '55 - Touggourt', value: '55'}, {title: '56 - Djanet', value: '56'}, {title: '57 - El M\'Ghair', value: '57'},
                  {title: '58 - El Meniaa', value: '58'}
                ]
              }
            },
            { name: 'desk', title: 'Prix Bureau (DZD)', type: 'number' },
            { name: 'home', title: 'Prix Domicile (DZD)', type: 'number' }
          ]
        }
      ]
    }
  ]
}
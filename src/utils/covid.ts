import * as XLSX from "xlsx";

//store elements as array instead of object for more lightweight data

export type CovidData = Record<
  string,
  Array<
    [
      år: number,
      veckonummer: number,
      Kum_antal_avlidna: number,
      Kum_antal_fall: number,
      Kum_antal_intensivvårdade: number,
      Kum_fall_100000inv: number,
    ]
  >
>;

export const KEYS = {
  år: 0,
  veckonummer: 1,
  Kum_antal_avlidna: 2,
  Kum_antal_fall: 3,
  Kum_antal_intensivvårdade: 4,
  Kum_fall_100000inv: 5,
} as const;

/**
 * covid data from Folkhalsomyndigheten [Folkhalsomyndigheten](https://www.folkhalsomyndigheten.se/smittskydd-beredskap/utbrott/aktuella-utbrott/covid-19/statistik-och-analyser/bekraftade-fall-i-sverige/)
 *
 * Fetch an excel document and parse it. The file is updated daily.
 */
export async function getSweCovidData() {
  const url = "https://www.arcgis.com/sharing/rest/content/items/b5e7488e117749c19881cce45db13f7e/data";
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf);

  const sheets = Object.values(wb.Sheets).map((sheet) => XLSX.utils.sheet_to_json(sheet)) as Sheets;
  //wb.SheetNames
  //const antal_per_dag_region = sheets[0];
  //const antal_avlidna_per_dag = sheets[1];
  //const antal_intensivvårdare_per_dag = sheets[2];
  //const totalt_antal_per_region = sheets[3];
  //const totalt_antal_per_kön = sheets[4];
  //const totalt_antal_per_åldersgrupp = sheets[5];
  const veckodata_region = sheets[6];
  //const veckodata_kommun_stadsdel = sheets[7];
  const veckodata_riket = sheets[8];
  //const information = sheets[9];

  const data: CovidData = {};
  for (const row of veckodata_region) {
    const r = row.Region.replaceAll(" ", "-");
    if (!data[r]) {
      data[r] = [];
    }
    data[r].push([
      row.år,
      row.veckonummer,
      row.Kum_antal_avlidna,
      row.Kum_antal_fall,
      row.Kum_antal_intensivvårdade,
      row.Kum_fall_100000inv,
    ]);
  }

  for (const row of veckodata_riket) {
    const r = "Sweden";
    if (!data[r]) {
      data[r] = [];
    }
    data[r].push([
      row.år,
      row.veckonummer,
      row.Kum_antal_avlidna,
      row.Kum_antal_fall,
      row.Kum_antal_intensivvårdade,
      row.Kum_fall_100000inv,
    ]);
  }

  return data;
}

type Sheet0 = {
  Statistikdatum: number;
  Totalt_antal_fall: number;
  Blekinge: number;
  Dalarna: number;
  Gotland: number;
  Gävleborg: number;
  Halland: number;
  Jämtland_Härjedalen: number;
  Jönköping: number;
  Kalmar: number;
  Kronoberg: number;
  Norrbotten: number;
  Skåne: number;
  Stockholm: number;
  Sörmland: number;
  Uppsala: number;
  Värmland: number;
  Västerbotten: number;
  Västernorrland: number;
  Västmanland: number;
  Västra_Götaland: number;
  Örebro: number;
  Östergötland: number;
};

type Sheet1 = {
  Datum_avliden: number;
  Antal_avlidna: number;
};

type Sheet2 = {
  Datum_vårdstart: number;
  Antal_intensivvårdade: number;
};

type Sheet3 = {
  Region: string;
  Totalt_antal_fall: number;
  Fall_per_100000_inv: number;
  Totalt_antal_intensivvårdade: number;
  Totalt_antal_avlidna: number;
};

type Sheet4 = {
  Kön: string;
  Totalt_antal_fall: number;
  Totalt_antal_intensivvårdade: number;
  Totalt_antal_avlidna: number;
};

type Sheet5 = {
  Åldersgrupp: string;
  Totalt_antal_fall: number;
  Totalt_antal_intensivvårdade: number;
  Totalt_antal_avlidna: number;
};

type Sheet6 = {
  år: number;
  veckonummer: number;
  Region: string;
  Antal_fall_vecka: number;
  Kum_antal_fall: number;
  Antal_intensivvårdade_vecka: number;
  Kum_antal_intensivvårdade: number;
  Antal_avlidna_vecka: number;
  Kum_antal_avlidna: number;
  Antal_fall_100000inv_vecka: number;
  Kum_fall_100000inv: number;
};

type Sheet7 = {
  år: number;
  veckonummer: number;
  KnKod: number; //str
  KnNamn: string;
  Stadsdel: string;
  Kommun_stadsdel: string;
  tot_antal_fall_per10000inv: number;
  antal_fall_per10000_inv: number;
  tot_antal_fall: number; //tr
  nya_fall_vecka: number; //str
};

type Sheet8 = {
  år: number;
  veckonummer: number;
  Antal_fall_vecka: number;
  Antal_fall_100000inv_vecka: number;
  Antal_fall_100000inv_14dagar: number;
  Kum_antal_fall: number;
  Kum_fall_100000inv: number;
  Antal_nyaintensivvårdade_vecka: number;
  Kum_antal_intensivvårdade: number;
  Antal_avlidna_vecka: number;
  Antal_avlidna_milj_inv_vecka: number;
  Kum_antal_avlidna: number;
  Kum_antal_avlidna_milj_inv: number;
};

type Sheet9 = {
  Information: string;
};

type Sheets = [Sheet0[], Sheet1[], Sheet2[], Sheet3[], Sheet4[], Sheet5[], Sheet6[], Sheet7[], Sheet8[], Sheet9[]];

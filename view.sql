create view CRM_Report as (
	select sc.kode_crm, sc.kode_sales, u.nama_sales, u.depot, sc.tanggal, 
	sc.nama_toko, sc.nama_pemilik, sc.alamat, sc.omset_nippon as 'NIPPON_PAINT',
	sum(case when (kode_competitor = 'CMP-0001') then omset else 0 end) as `DULUX`,
	sum(case when (kode_competitor = 'CMP-0002') then omset else 0 end) as `AVIAN`,
	sum(case when (kode_competitor = 'CMP-0003') then omset else 0 end) as `PROPAN`,
	sum(case when (kode_competitor = 'CMP-0004') then omset else 0 end) as `MOWILEX`,
	sum(case when (kode_competitor = 'CMP-0005') then omset else 0 end) as `DANAPAINT`,
	sum(case when (kode_competitor = 'CMP-0006') then omset else 0 end) as `JOTUN`,
	sum(case when (kode_competitor = 'CMP-0007') then omset else 0 end) as `KANSAI`,
	sum(case when (kode_competitor = 'CMP-0008') then omset else 0 end) as `SANCENTIA`,
	sum(case when (kode_competitor = 'CMP-0009') then omset else 0 end) as `PACIFIC_PAINT`,
	sum(case when (kode_competitor = 'CMP-0010') then omset else 0 end) as `WARNA_AGUNG`,
	sum(case when (kode_competitor = 'CMP-0011') then omset else 0 end) as `RAJAWALI`,
	sum(case when (kode_competitor = 'CMP-0012') then omset else 0 end) as `TUNGGAL_JAYA`
	from sales_crm sc 
	left join omset_competitor oc on sc.kode_crm = oc.kode_crm
	left join user u on sc.kode_sales = u.kode_sales
	group by sc.kode_crm
);

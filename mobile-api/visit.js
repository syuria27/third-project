var mysql = require("mysql");
const isset = require('isset');
var fs = require( 'fs' );
var pad = require('pad-left');

function VISIT_ROUTER(router,pool) {
    var self = this;
    self.handleRoutes(router,pool);
}

VISIT_ROUTER.prototype.handleRoutes= function(router,pool) {
    
    router.get('/visit/pulang/:kode_sales/:tanggal',function(req,res){
    	var data = { error:true,
			    	 error_msg:'' };

        var query = `SELECT kode_visit,nama_toko, DATE_FORMAT(tanggal, '%d-%m-%Y') as tanggal,
        			jam_pulang,lokasi_pulang FROM visit WHERE kode_sales = ? AND tanggal = ? `;
        var table = [req.params.kode_sales,req.params.tanggal];
        query = mysql.format(query,table);
        pool.getConnection(function(err,connection){
		    connection.query(query,function(err,rows){
	            connection.release();
	            if(err) {
	                res.status(500);
                    data.error_msg = 'Error executing MySQL query';
                    res.json(data);
	            } else {
	            	if(rows.length != 0){
	            		res.status(200);
	                	data.error = false;
				        data.error_msg = 'Success..';
				        data.history = rows;
				        res.json(data);
			        }else{
			        	res.status(404);
			            data.error_msg = 'No History Found..';
			            res.json(data);
			        }
	            }
	        });
	    });
    });

    router.get('/visit/masuk/:kode_sales/:tanggal',function(req,res){
    	var data = { error:true,
			    	 error_msg:'' };

        var query = `SELECT kode_visit,nama_toko, DATE_FORMAT(tanggal, '%d-%m-%Y') as tanggal,
        			jam_masuk,lokasi_masuk FROM visit WHERE kode_sales = ? AND tanggal = ? `;
        var table = [req.params.kode_sales,req.params.tanggal];
        query = mysql.format(query,table);
        pool.getConnection(function(err,connection){
		    connection.query(query,function(err,rows){
	            connection.release();
	            if(err) {
	                res.status(500);
                    data.error_msg = 'Error executing MySQL query';
                    res.json(data);
	            } else {
	            	if(rows.length != 0){
	            		res.status(200);
	                	data.error = false;
				        data.error_msg = 'Success..';
				        data.history = rows;
				        res.json(data);
			        }else{
			        	res.status(404);
			            data.error_msg = 'No History Found..';
			            res.json(data);
			        }
	            }
	        });
	    });
    });

    router.post('/visit/masuk',function(req,res){
    	var data = { error:true,
			    	 error_msg:'' };

		if (isset(req.body.kode_sales) && isset(req.body.nama_toko)
		 && isset(req.body.lokasi) && isset(req.body.photo)) {
	        	var query = `SELECT * FROM visit WHERE kode_sales = ? AND tanggal 
	        				= DATE(CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'))
	        				ORDER BY id DESC LIMIT 1`;
	        	var table = [req.body.kode_sales];
        		query = mysql.format(query,table);
        		pool.getConnection(function(err,connection){
		    		connection.query(query,function(err,rows){
	        			connection.release();
	            		if(err) {
			                res.status(500);
                            data.error_msg = 'Error executing MySQL query';
                            res.json(data);
			            } else {
			                if(rows.length > 0){
			                	if (rows[0].jam_pulang !== null) {
			                		var query = `INSERT INTO visit (kode_sales, nama_toko, tanggal, jam_masuk, lokasi_masuk, lokasi_pulang) 
							    				VALUES(?, ?, CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), 
							    				CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), ?, ?)`;
						        	var table = [req.body.kode_sales, req.body.nama_toko, req.body.lokasi, req.body.lokasi];
					        		query = mysql.format(query,table);
					        		pool.getConnection(function(err,connection){
				    					connection.query(query,function(err,results){
						        			connection.release();
		            						if(err) {
						        				res.status(500);
					                            data.error_msg = 'Error executing MySQL query';
					                            res.json(data);
								            } else {
								            	var kode_visit = 'VST-' + (pad(results.insertId, 11, '0'));
								            	var query = `UPDATE visit SET kode_visit = ? WHERE id = ?`;
									        	var table = [kode_visit,results.insertId];
								        		query = mysql.format(query,table);
								        		pool.getConnection(function(err,connection){
				    								connection.query(query,function(err){
									        			connection.release();
		            									if (err) {
									        				res.status(500);
								                            data.error_msg = 'Error executing MySQL query';
								                            res.json(data);
									        			}else{
									        				fs.writeFile('./upload/'+kode_visit+'-M.jpeg', req.body.photo, 'base64', function(err) {
															});
															res.status(200);
	                                                        data.error = false;
	                                                        data.error_msg = 'Visit succesfuly submited..';
	                                                        res.json(data);
											        	}
									        		});
									        	});
								            }
								        }); 
								    });
			                	} else {
			                		res.status(400);
	                                data.error = true;
	                                data.error_msg = 'Visit pulang dahulu..';
	                                res.json(data);
			                	}
						    }else{
						    	var query = `INSERT INTO visit (kode_sales, nama_toko, tanggal, jam_masuk, lokasi_masuk, lokasi_pulang) 
						    				VALUES(?, ?, CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), 
						    				CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), ?, ?)`;
					        	var table = [req.body.kode_sales, req.body.nama_toko, req.body.lokasi, req.body.lokasi];
				        		query = mysql.format(query,table);
				        		pool.getConnection(function(err,connection){
			    					connection.query(query,function(err,results){
					        			connection.release();
	            						if(err) {
					        				res.status(500);
				                            data.error_msg = 'Error executing MySQL query';
				                            res.json(data);
							            } else {
							            	var kode_visit = 'VST-' + (pad(results.insertId, 11, '0'));
							            	var query = `UPDATE visit SET kode_visit = ? WHERE id = ?`;
								        	var table = [kode_visit,results.insertId];
							        		query = mysql.format(query,table);
							        		pool.getConnection(function(err,connection){
			    								connection.query(query,function(err){
								        			connection.release();
	            									if (err) {
								        				res.status(500);
							                            data.error_msg = 'Error executing MySQL query';
							                            res.json(data);
								        			}else{
								        				fs.writeFile('./upload/'+kode_visit+'-M.jpeg', req.body.photo, 'base64', function(err) {
														});
														res.status(200);
                                                        data.error = false;
                                                        data.error_msg = 'Visit succesfuly submited..';
                                                        res.json(data);
										        	}
								        		});
								        	});
							            }
							        }); 
							    });
					        }
			            }
	        		});
	        	});
	    }else{
	    	res.status(400);
            data.error_msg = 'Missing some params..';
            res.json(data);
	    }
    });

	router.post('/visit/pulang',function(req,res){
    	var data = { error:true,
			    	 error_msg:'' };

		if (isset(req.body.kode_sales) && isset(req.body.nama_toko)
		 && isset(req.body.lokasi) && isset(req.body.photo)) {
	        	var query = `SELECT *, DATE_FORMAT(tanggal, '%Y-%m-%d') as tgl
	        				FROM visit WHERE kode_sales = ? AND tanggal 
	        				= DATE(CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'))
	        				ORDER BY id DESC LIMIT 1`;
	        	var table = [req.body.kode_sales];
        		query = mysql.format(query,table);
        		pool.getConnection(function(err,connection){
		    		connection.query(query,function(err,rows){
	        			connection.release();
	            		if(err) {
			                res.status(500);
                            data.error_msg = 'Error executing MySQL query';
                            res.json(data);
			            } else {
			                if(rows.length > 0){
			                	if (rows[0].jam_pulang !== null) {
			                		res.status(400);
	                                data.error = true;
	                                data.error_msg = 'Visit datang dahulu..';
	                                res.json(data);
			                	} else {
			                		var kode_visit = rows[0].kode_visit;
			                		var jam_masuk = rows[0].jam_masuk;
			                		var tgl = rows[0].tgl;
			                		var datetime = tgl+' '+jam_masuk;
									var query = `UPDATE visit SET 
												jam_pulang = CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), 
												selisih = TIMESTAMPDIFF(MINUTE,?,CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'))
												WHERE kode_visit = ?`;
									var table = [datetime, kode_visit];
								    query = mysql.format(query,table);
									pool.getConnection(function(err,connection){
			    						connection.query(query,function(err,results){
									   		connection.release();
	            							if(err) {
									     		res.status(500);
						                        data.error_msg = 'Error executing MySQL query';
						                        res.json(data);
						                    } else {
											    /*fs.writeFile('./upload/'+kode_visit+'-P.jpeg', req.body.photo, 'base64', 
											    	function(err) {}
											    );*/
												res.status(200);
                                                data.error = false;
                                                data.error_msg = 'Visit succesfuly submited';
                                                res.json(data);
                                            }
										});
									});
			                	}
						    }else{
						    	res.status(400);
	                            data.error = true;
	                            data.error_msg = 'Visit datang dahulu..';
	                            res.json(data);
					        }
			            }
	        		});
	        	});
	    }else{
	    	res.status(400);
            data.error_msg = 'Missing some params..';
            res.json(data);
	    }
    });
}

module.exports = VISIT_ROUTER;

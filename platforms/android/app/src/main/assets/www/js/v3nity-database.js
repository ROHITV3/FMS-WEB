/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var Database = function(databaseName)
{
    var _this = {
        /*
         * the database object...
         */
        database: null,
        /*
         * error callback function...
         */
        error: function(text)
        {
            return text;
        },
        /*
         * opens the sql database...
         */
        open: function()
        {
            this.database = window.sqlitePlugin.openDatabase({name: databaseName, location: 'default'});
        },
        /*
         * creates database table...
         *
         */
        create: function(name, columns, errorCallback)
        {
            var meta = [];

            for (i = 0; i < columns.length; i++)
            {
                var column = columns[i];

                var columnInfo = '';

                if (column.name !== undefined)
                {
                    columnInfo += column.name;
                }
                else
                {
                    this.error('no column name defined');

                    return;
                }

                if (column.type !== undefined)
                {
                    columnInfo += ' ' + column.type;
                }
                else
                {
                    this.error('no column name defined');

                    return;
                }

                if (column.primaryKey !== undefined && column.primaryKey === true)
                {
                    columnInfo += ' PRIMARY KEY';
                }

                if (column.nullable !== undefined && column.nullable === false)
                {
                    columnInfo += ' NOT NULL';
                }

                meta.push(columnInfo);
            }
            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    transaction.executeSql('CREATE TABLE IF NOT EXISTS ' + name + ' (' + meta.join(',') + ' )', [],
                        function(tx, results)
                        {

                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                });
            }
        },
        /*
         * adds a record...
         */
        add: function(tableName, columns, errorCallback)
        {
            var columnNames = [], columnValues = [], columnCounters = [];

            for (i = 0; i < columns.length; i++)
            {
                columnNames.push(columns[i].name);

                columnValues.push(columns[i].value);

                columnCounters.push('?');
            }

            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var executeQuery = 'INSERT INTO ' + tableName + ' (' + columnNames.join(',') + ') VALUES (' + columnCounters.join(',') + ')';
                    
                    transaction.executeSql(executeQuery, columnValues,
                        function(tx, results)
                        {
                            
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                });
            }
        },
        /*
         * adds a record...
         */
        deleteAll: function(tableName, successCallback, errorCallback)
        {
            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var executeQuery = 'DELETE FROM ' + tableName;
                    
                    transaction.executeSql(executeQuery, [],
                        function(tx, results)
                        {
                            successCallback(results);
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                });
            }
        },
        
        
        deleteData: function(tableName,checkColumns, successCallback, errorCallback)
        {
            var checkColumnNames = [], checkColumnValues = [], checkColumnCounters = [];

            for (i = 0; i < checkColumns.length; i++)
            {
                checkColumnNames.push(checkColumns[i].name);

                checkColumnValues.push(checkColumns[i].value);
                
                checkColumnCounters.push('?');
            }
            
            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                  //  var executeQuery = 'DELETE FROM ' + tableName;
                    var executeQuery = 'DELETE FROM ' + tableName ;
                    
                    executeQuery += ' WHERE ';
                    
                    for (i = 0; i < checkColumns.length; i++)
                    {
                        if (i > 0)
                        {
                            executeQuery += ' AND ';
                        }
                        executeQuery += checkColumnNames[i] + ' = ' + checkColumnCounters[i];
                    }
                    
                    transaction.executeSql(executeQuery, [],
                        function(tx, results)
                        {
                            successCallback(results);
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                });
            }
        },
        
        /*
         * update a record...
         */
        update: function(tableName, columns, checkColumns, errorCallback)
        {
            var columnNames = [], columnValues = [], columnCounters = [];

            for (i = 0; i < columns.length; i++)
            {
                columnNames.push(columns[i].name);

                columnValues.push(columns[i].value);
                
                columnCounters.push('?');
            }
            
            var checkColumnNames = [], checkColumnValues = [], checkColumnCounters = [];

            for (i = 0; i < checkColumns.length; i++)
            {
                checkColumnNames.push(checkColumns[i].name);

                checkColumnValues.push(checkColumns[i].value);
                
                checkColumnCounters.push('?');
            }

            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var executeQuery = 'UPDATE ' + tableName + ' SET ';
                    
                    for (i = 0; i < columns.length; i++)
                    {
                        if (i > 0)
                        {
                            executeQuery += ', ';
                        }
                        executeQuery += columnNames[i] + ' = ' + columnCounters[i];
                    }
                    
                    executeQuery += ' WHERE ';
                    
                    for (i = 0; i < checkColumns.length; i++)
                    {
                        if (i > 0)
                        {
                            executeQuery += ' AND ';
                        }
                        executeQuery += checkColumnNames[i] + ' = ' + checkColumnCounters[i];
                    }
                    
                    
                    
                    
                    
                    var tempQuery = 'UPDATE ' + tableName + ' SET ';
                    
                    for (i = 0; i < columns.length; i++)
                    {
                        if (i > 0) tempQuery += ', ';
                        tempQuery += columns[i].name;
                        tempQuery += ' = \'' + columns[i].value + '\''
                    }
                    
                    tempQuery += ' WHERE '
                    
                    for (i = 0; i < checkColumns.length; i++)
                    {
                        if (i > 0) tempQuery += ' AND ';
                        tempQuery += checkColumns[i].name;
                        tempQuery += ' = \'' + checkColumns[i].value + '\''
                    }
                    
                    
            
                    transaction.executeSql(tempQuery, [],
                        function(tx, results)
                        {
                            console.log('ttttteeee');
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                    
//                    transaction.executeSql(executeQuery, columnValues,
//                        function(tx, results)
//                        {
//                            
//                        },
//                        function(tx, error)
//                        {
//                            if (errorCallback !== undefined)
//                            {
//                                errorCallback(error);
//                            }
//                        });
                });
            }
        },
        
         updateNew: function(tableName, columns, checkColumns, errorCallback,successCallback)
        {
            var columnNames = [], columnValues = [], columnCounters = [];

            for (i = 0; i < columns.length; i++)
            {
                columnNames.push(columns[i].name);

                columnValues.push(columns[i].value);
                
                columnCounters.push('?');
            }
            
            var checkColumnNames = [], checkColumnValues = [], checkColumnCounters = [];

            for (i = 0; i < checkColumns.length; i++)
            {
                checkColumnNames.push(checkColumns[i].name);

                checkColumnValues.push(checkColumns[i].value);
                
                checkColumnCounters.push('?');
            }

            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var executeQuery = 'UPDATE ' + tableName + ' SET ';
                    
                    for (i = 0; i < columns.length; i++)
                    {
                        if (i > 0)
                        {
                            executeQuery += ', ';
                        }
                        executeQuery += columnNames[i] + ' = ' + columnCounters[i];
                    }
                    
                    executeQuery += ' WHERE ';
                    
                    for (i = 0; i < checkColumns.length; i++)
                    {
                        if (i > 0)
                        {
                            executeQuery += ' AND ';
                        }
                        executeQuery += checkColumnNames[i] + ' = ' + checkColumnCounters[i];
                    }
                    
                    
                    
                    
                    
                    var tempQuery = 'UPDATE ' + tableName + ' SET ';
                    
                    for (i = 0; i < columns.length; i++)
                    {
                        if (i > 0) tempQuery += ', ';
                        tempQuery += columns[i].name;
                        tempQuery += ' = \'' + columns[i].value + '\''
                    }
                    
                    tempQuery += ' WHERE '
                    
                    for (i = 0; i < checkColumns.length; i++)
                    {
                        if (i > 0) tempQuery += ' AND ';
                        tempQuery += checkColumns[i].name;
                        tempQuery += ' = \'' + checkColumns[i].value + '\''
                    }
                    
                    
            
                    transaction.executeSql(tempQuery, [],
                        function(tx, results)
                        {
                            if (successCallback !== undefined)
                            {
                                successCallback(results);
                            }
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                    
//                    transaction.executeSql(executeQuery, columnValues,
//                        function(tx, results)
//                        {
//                            
//                        },
//                        function(tx, error)
//                        {
//                            if (errorCallback !== undefined)
//                            {
//                                errorCallback(error);
//                            }
//                        });
                });
            }
        },
        /*
         * update a record...
         */
        updateAll: function(tableName, columns, errorCallback)
        {
            var columnNames = [], columnValues = [], columnCounters = [];

            for (i = 0; i < columns.length; i++)
            {
                columnNames.push(columns[i].name);

                columnValues.push(columns[i].value);
                
                columnCounters.push('?');
            }
            
            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var tempQuery = 'UPDATE ' + tableName + ' SET ';
                    
                    for (i = 0; i < columns.length; i++)
                    {
                        if (i > 0) tempQuery += ', ';
                        tempQuery += columns[i].name;
                        tempQuery += ' = \'' + columns[i].value + '\''
                    }
                    
                    transaction.executeSql(tempQuery, [],
                        function(tx, results)
                        {
                            
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                });
            }
        },
        /*
         * gets records...
         */
        get: function(tableName, columns, successCallback, errorCallback)
        {
            var columnNames = [], columnValues = [], columnCounters = [];

            for (i = 0; i < columns.length; i++)
            {
                columnNames.push(columns[i].name);

                columnValues.push(columns[i].value);

                columnCounters.push('?');
            }

            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var executeQuery = 'SELECT * FROM ' + tableName + ' WHERE ';
                    
                    for (i = 0; i < columns.length; i++)
                    {
                        if (i > 0)
                        {
                            executeQuery += ' AND ';
                        }
                        executeQuery += columnNames[i] + ' = ' + columnCounters[i];
                    }
                    
                    transaction.executeSql(executeQuery, columnValues,
                        function(tx, results)
                        {
                            successCallback(results);
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                });
            }
        },
        /*
         * Get all records
         */
        getAll: function(tableName, successCallback, errorCallback)
        {
            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var executeQuery = 'SELECT * FROM ' + tableName;
                    
                    transaction.executeSql(executeQuery, [],
                        function(tx, results)
                        {
                            successCallback(results);
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                });
            }
        },
        /*
         * update record, or insert record if doesn't exist
         */
        updateOrAdd: function(tableName, columns, checkColumns, errorCallback)
        {
            var checkColumnNames = [], checkColumnValues = [], checkColumnCounters = [];

            for (i = 0; i < checkColumns.length; i++)
            {
                checkColumnNames.push(checkColumns[i].name);

                checkColumnValues.push(checkColumns[i].value);

                checkColumnCounters.push('?');
            }

            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var executeQuery = 'SELECT * FROM ' + tableName + ' WHERE ';
                    
                    for (i = 0; i < checkColumns.length; i++)
                    {
                        if (i > 0)
                        {
                            executeQuery += ' AND ';
                        }
                        executeQuery += checkColumnNames[i] + ' = ' + checkColumnCounters[i];
                    }
                    
                    transaction.executeSql(executeQuery, checkColumnValues,
                        function(tx, results)
                        {
                            if (results.rows.length == 0)
                            {
                                // insert if no data yet
                                _this.add(tableName, columns, errorCallback);
                            }
                            else
                            {
                                // update otherwise
                                _this.update(tableName, columns, checkColumns, errorCallback);
                            }
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                });
            }
        },
        
        updateOrAddNew: function(tableName, columns, checkColumns, errorCallback,successCallback)
        {
            var checkColumnNames = [], checkColumnValues = [], checkColumnCounters = [];

            for (i = 0; i < checkColumns.length; i++)
            {
                checkColumnNames.push(checkColumns[i].name);

                checkColumnValues.push(checkColumns[i].value);

                checkColumnCounters.push('?');
            }

            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var executeQuery = 'SELECT * FROM ' + tableName + ' WHERE ';
                    
                    for (i = 0; i < checkColumns.length; i++)
                    {
                        if (i > 0)
                        {
                            executeQuery += ' AND ';
                        }
                        executeQuery += checkColumnNames[i] + ' = ' + checkColumnCounters[i];
                    }
                    
                    transaction.executeSql(executeQuery, checkColumnValues,
                        function(tx, results)
                        {
                            if (results.rows.length == 0)
                            {
                                // insert if no data yet
                                _this.add(tableName, columns, errorCallback,successCallback);
                            }
                            else
                            {
                                // update otherwise
                                _this.updateNew(tableName, columns, checkColumns, errorCallback,successCallback);
                            }
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        },
                        function(tx, success)
                        {
                            if (successCallback !== undefined)
                            {
                                successCallback(success);
                            }
                        });
                });
            }
        },
        /*
         * gets the count of records in the table...
         */
        count: function(tableName, errorCallback)
        {
            var count = 0;

            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var executeQuery = 'SELECT count(*) FROM ' + tableName;

                    transaction.executeSql(executeQuery, [],
                        function(tx, results)
                        {
                            count = results.rows.length;
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                });
            }

            return count;
        },
        /*
         *  Be careful with deleting tables.
         */
        dropTable: function(tableName, errorCallback)
        {
            var count = 0;

            if (this.database !== null)
            {
                this.database.transaction(function(transaction)
                {
                    var executeQuery = 'DROP TABLE IF EXISTS ' + tableName;

                    transaction.executeSql(executeQuery, [],
                        function(tx, results)
                        {
                            
                        },
                        function(tx, error)
                        {
                            if (errorCallback !== undefined)
                            {
                                errorCallback(error);
                            }
                        });
                });
            }

            return count;
        }
    };

    return _this;
};
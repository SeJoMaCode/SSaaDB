// Compiled using undefined undefined (TypeScript 4.9.5)
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var SSaaDBError = /** @class */ (function (_super) {
    __extends(SSaaDBError, _super);
    /**
    * Custom error class for SSaaDB errors.
    * @param message - The error message.
    */
    function SSaaDBError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'SSaaDBError';
        return _this;
    }
    return SSaaDBError;
}(Error));
var SSaaDB = /** @class */ (function () {
    /**
    * Creates a new instance of SSaaDB.
    * @param spreadsheetId - The ID of the Google Spreadsheet to use as the database.
    */
    function SSaaDB(spreadsheetId) {
        this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    }
    /**
    * Creates a new table with the specified name and headers.
    * @param tableName - The name of the table to create.
    * @param headers - An array of column headers for the table.
    * @throws {SSaaDBError} If the table already exists.
    */
    SSaaDB.prototype.createTable = function (tableName, headers) {
        var sheet = this.spreadsheet.getSheetByName(tableName);
        if (sheet) {
            throw new SSaaDBError("Table '".concat(tableName, "' already exists."));
        }
        var newSheet = this.spreadsheet.insertSheet(tableName);
        newSheet.appendRow(headers);
    };
    /**
    * Deletes the specified table.
    * @param tableName - The name of the table to delete.
    * @throws {SSaaDBError} If the table does not exist.
    */
    SSaaDB.prototype.deleteTable = function (tableName) {
        var sheet = this.spreadsheet.getSheetByName(tableName);
        if (!sheet) {
            throw new SSaaDBError("Table '".concat(tableName, "' does not exist."));
        }
        this.spreadsheet.deleteSheet(sheet);
    };
    /**
    * Retrieves the names of all tables in the database.
    * @returns An array of table names.
    */
    SSaaDB.prototype.getTables = function () {
        var sheets = this.spreadsheet.getSheets();
        var tableNames = sheets.map(function (sheet) { return sheet.getName(); });
        return tableNames;
    };
    /**
    * Renames the specified table.
    * @param oldTableName - The current name of the table.
    * @param newTableName - The new name for the table.
    * @throws {SSaaDBError} If the table does not exist.
    */
    SSaaDB.prototype.renameTable = function (oldTableName, newTableName) {
        var sheet = this.spreadsheet.getSheetByName(oldTableName);
        if (!sheet) {
            throw new SSaaDBError("Table '".concat(oldTableName, "' does not exist."));
        }
        sheet.setName(newTableName);
    };
    /**
    * Copies the source table to a new table with the specified name.
    * @param sourceTableName - The name of the source table to copy.
    * @param destinationTableName - The name of the new table to create.
    * @throws {SSaaDBError} If the source table does not exist or the destination table already exists.
    */
    SSaaDB.prototype.copyTable = function (sourceTableName, destinationTableName) {
        var sourceSheet = this.spreadsheet.getSheetByName(sourceTableName);
        if (!sourceSheet) {
            throw new SSaaDBError("Table '".concat(sourceTableName, "' does not exist."));
        }
        var destinationSheet = this.spreadsheet.getSheetByName(destinationTableName);
        if (destinationSheet) {
            throw new SSaaDBError("Table '".concat(destinationTableName, "' already exists."));
        }
        var copiedSheet = sourceSheet.copyTo(this.spreadsheet);
        copiedSheet.setName(destinationTableName);
    };
    /**
    * Inserts a new entry into the specified table.
    * @param tableName - The name of the table to insert the entry into.
    * @param data - An array of values representing the entry data.
    * @throws {SSaaDBError} If the table does not exist.
    */
    SSaaDB.prototype.insertEntry = function (tableName, data) {
        var sheet = this.spreadsheet.getSheetByName(tableName);
        if (!sheet) {
            throw new SSaaDBError("Table '".concat(tableName, "' does not exist."));
        }
        sheet.appendRow(data);
    };
    /**
    * Deletes entries from the specified table that match the filter criteria.
    * @param tableName - The name of the table to delete entries from.
    * @param filterCriteria - An object specifying the filter criteria for deletion.
    * @throws {SSaaDBError} If the table does not exist.
    */
    SSaaDB.prototype.deleteEntries = function (tableName, filterCriteria) {
        var _this = this;
        var sheet = this.spreadsheet.getSheetByName(tableName);
        if (!sheet) {
            throw new SSaaDBError("Table '".concat(tableName, "' does not exist."));
        }
        var data = sheet.getDataRange().getValues();
        var headers = data.shift();
        var rowsToDelete = data.reduce(function (rows, row, index) {
            var entry = headers.reduce(function (obj, header, idx) {
                obj[header] = row[idx];
                return obj;
            }, {});
            if (_this.matchesFilter(entry, filterCriteria)) {
                rows.push(index + 2);
            }
            return rows;
        }, []);
        rowsToDelete.reverse().forEach(function (rowNumber) {
            sheet.deleteRow(rowNumber);
        });
    };
    /**
    * Updates entries in the specified table that match the filter criteria with the provided data.
    * @param tableName - The name of the table to update entries in.
    * @param filterCriteria - An object specifying the filter criteria for updating.
    * @param updatedData - An object representing the updated data to apply to matching entries.
    * @throws {SSaaDBError} If the table does not exist.
    */
    SSaaDB.prototype.updateEntries = function (tableName, filterCriteria, updatedData) {
        var _this = this;
        var sheet = this.spreadsheet.getSheetByName(tableName);
        if (!sheet) {
            throw new SSaaDBError("Table '".concat(tableName, "' does not exist."));
        }
        var data = sheet.getDataRange().getValues();
        var headers = data.shift();
        data.forEach(function (row, index) {
            var entry = headers.reduce(function (obj, header, idx) {
                obj[header] = row[idx];
                return obj;
            }, {});
            if (_this.matchesFilter(entry, filterCriteria)) {
                headers.forEach(function (header, idx) {
                    if (updatedData[header] !== undefined) {
                        sheet.getRange(index + 2, idx + 1).setValue(updatedData[header]);
                    }
                });
            }
        });
    };
    /**
    * Retrieves entries from the specified table that match the filter criteria and selected columns.
    * @param tableName - The name of the table to retrieve entries from.
    * @param filterCriteria - An object specifying the filter criteria for retrieval (optional).
    * @param headers - An array of column names to include in the result (optional).
    * @returns An array of objects representing the retrieved entries.
    * @throws {SSaaDBError} If the table does not exist.
    */
    SSaaDB.prototype.getEntries = function (tableName, filterCriteria, headers) {
        var _this = this;
        if (filterCriteria === void 0) { filterCriteria = null; }
        if (headers === void 0) { headers = null; }
        var sheet = this.spreadsheet.getSheetByName(tableName);
        if (!sheet) {
            throw new SSaaDBError("Table '".concat(tableName, "' does not exist."));
        }
        var data = sheet.getDataRange().getValues();
        var _headers = data.shift();
        var entries = data.map(function (row) {
            return _headers.reduce(function (obj, _header, index) {
                obj[_header] = row[index];
                return obj;
            }, {});
        });
        if (filterCriteria) {
            entries = entries.filter(function (entry) { return _this.matchesFilter(entry, filterCriteria); });
        }
        if (headers) {
            entries = entries.map(function (entry) {
                return headers.reduce(function (obj, header) {
                    obj[header] = entry[header];
                    return obj;
                }, {});
            });
        }
        return entries;
    };
    /**
    * Performs an inner join on two tables based on a join key and retrieves the specified headers.
    * @param table1Name - The name of the first table to join.
    * @param table2Name - The name of the second table to join.
    * @param joinKey - The common key to join the tables on.
    * @param headers - An array of column names to include in the result (optional).
    * @returns An array of objects representing the joined entries with the selected columns.
    */
    SSaaDB.prototype.joinInner = function (table1Name, table2Name, joinKey, headers) {
        if (headers === void 0) { headers = null; }
        var table1Entries = headers
            ? this.getEntries(table1Name, null, __spreadArray([joinKey], headers.filter(function (header) { return header.startsWith(table1Name + '.'); }).map(function (header) { return header.split('.')[1]; }), true))
            : this.getEntries(table1Name);
        var table2Entries = headers
            ? this.getEntries(table2Name, null, __spreadArray([joinKey], headers.filter(function (header) { return header.startsWith(table2Name + '.'); }).map(function (header) { return header.split('.')[1]; }), true))
            : this.getEntries(table2Name);
        var joinedEntries = table1Entries.map(function (entry1) {
            var entry2 = table2Entries.find(function (entry) { return entry[joinKey] === entry1[joinKey]; });
            return __assign(__assign({}, entry1), entry2);
        });
        if (headers) {
            var selectedHeaders = headers.map(function (header) { return header.split('.')[1]; });
            return joinedEntries.map(function (entry) {
                return selectedHeaders.reduce(function (obj, header) {
                    obj[header] = entry[header];
                    return obj;
                }, {});
            });
        }
        return joinedEntries;
    };
    /**
    * Retrieves the headers (column names) of the specified table.
    * @param tableName - The name of the table to retrieve headers from.
    * @returns An array of strings representing the table headers.
    * @throws {SSaaDBError} If the table does not exist.
    */
    SSaaDB.prototype.getHeaders = function (tableName) {
        var sheet = this.spreadsheet.getSheetByName(tableName);
        if (!sheet) {
            throw new SSaaDBError("Table '".concat(tableName, "' does not exist."));
        }
        var headers = sheet.getDataRange().getValues().shift();
        return headers;
    };
    /**
    * Counts the number of entries in the specified table.
    * @param tableName - The name of the table to count entries in.
    * @returns The number of entries in the table.
    * @throws {SSaaDBError} If the table does not exist.
    */
    SSaaDB.prototype.countEntries = function (tableName) {
        var sheet = this.spreadsheet.getSheetByName(tableName);
        if (!sheet) {
            throw new SSaaDBError("Table '".concat(tableName, "' does not exist."));
        }
        var rowCount = sheet.getLastRow() - 1;
        return rowCount;
    };
    /**
    * Clears all data from the specified table, keeping the headers intact.
    * @param tableName - The name of the table to clear.
    * @throws {SSaaDBError} If the table does not exist.
    */
    SSaaDB.prototype.clearTable = function (tableName) {
        var sheet = this.spreadsheet.getSheetByName(tableName);
        if (!sheet) {
            throw new SSaaDBError("Table '".concat(tableName, "' does not exist."));
        }
        var dataRange = sheet.getDataRange();
        var numRows = dataRange.getNumRows();
        var numColumns = dataRange.getNumColumns();
        sheet.getRange(2, 1, numRows - 1, numColumns).clearContent();
    };
    SSaaDB.prototype.matchesFilter = function (entry, filterCriteria) {
        return Object.keys(filterCriteria).every(function (key) {
            var _a = filterCriteria[key], operator = _a.operator, value = _a.value;
            switch (operator) {
                case '==':
                    return entry[key] === value;
                case '!=':
                    return entry[key] !== value;
                case '>':
                    return entry[key] > value;
                case '>=':
                    return entry[key] >= value;
                case '<':
                    return entry[key] < value;
                case '<=':
                    return entry[key] <= value;
                case 'in':
                    return Array.isArray(value) && value.includes(entry[key]);
                case 'not in':
                    return Array.isArray(value) && !value.includes(entry[key]);
                default:
                    throw new SSaaDBError("Invalid operator: ".concat(operator));
            }
        });
    };
    return SSaaDB;
}());

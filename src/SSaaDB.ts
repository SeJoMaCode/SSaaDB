class SSaaDBError extends Error {
  /**
  * Custom error class for SSaaDB errors.
  * @param message - The error message.
  */
  constructor(message: string) {
    super(message);
    this.name = 'SSaaDBError';
  }
}

class SSaaDB {
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

    /**
    * Creates a new instance of SSaaDB.
    * @param spreadsheetId - The ID of the Google Spreadsheet to use as the database.
    */
    constructor(spreadsheetId: string) {
      this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    }
  
    /**
    * Creates a new table with the specified name and headers.
    * @param tableName - The name of the table to create.
    * @param headers - An array of column headers for the table.
    * @throws {SSaaDBError} If the table already exists.
    */
    createTable(tableName: string, headers: string[]): void {
      const sheet = this.spreadsheet.getSheetByName(tableName);
      if (sheet) {
        throw new SSaaDBError(`Table '${tableName}' already exists.`);
      }
  
      const newSheet = this.spreadsheet.insertSheet(tableName);
      newSheet.appendRow(headers);
    }
  
    /**
    * Deletes the specified table.
    * @param tableName - The name of the table to delete.
    * @throws {SSaaDBError} If the table does not exist.
    */
    deleteTable(tableName: string): void {
      const sheet = this.spreadsheet.getSheetByName(tableName);
      if (!sheet) {
        throw new SSaaDBError(`Table '${tableName}' does not exist.`);
      }

      this.spreadsheet.deleteSheet(sheet);
    }
  
    /**
    * Retrieves the names of all tables in the database.
    * @returns An array of table names.
    */
    getTables(): string[] {
      const sheets = this.spreadsheet.getSheets();
      const tableNames = sheets.map((sheet) => sheet.getName());
      return tableNames;
    }
  
    /**
    * Renames the specified table.
    * @param oldTableName - The current name of the table.
    * @param newTableName - The new name for the table.
    * @throws {SSaaDBError} If the table does not exist.
    */
    renameTable(oldTableName: string, newTableName: string): void {
      const sheet = this.spreadsheet.getSheetByName(oldTableName);
      if (!sheet) {
        throw new SSaaDBError(`Table '${oldTableName}' does not exist.`);
      }

      sheet.setName(newTableName);
    }
  
    /**
    * Copies the source table to a new table with the specified name.
    * @param sourceTableName - The name of the source table to copy.
    * @param destinationTableName - The name of the new table to create.
    * @throws {SSaaDBError} If the source table does not exist or the destination table already exists.
    */
    copyTable(sourceTableName: string, destinationTableName: string): void {
      const sourceSheet = this.spreadsheet.getSheetByName(sourceTableName);
      if (!sourceSheet) {
        throw new SSaaDBError(`Table '${sourceTableName}' does not exist.`);
      }

      const destinationSheet = this.spreadsheet.getSheetByName(destinationTableName);
      if (destinationSheet) {
        throw new SSaaDBError(`Table '${destinationTableName}' already exists.`);
      }

      const copiedSheet = sourceSheet.copyTo(this.spreadsheet);
      copiedSheet.setName(destinationTableName);
    }
  
    /**
    * Inserts a new entry into the specified table.
    * @param tableName - The name of the table to insert the entry into.
    * @param data - An array of values representing the entry data.
    * @throws {SSaaDBError} If the table does not exist.
    */
    insertEntry(tableName: string, data: any[]): void {
      const sheet = this.spreadsheet.getSheetByName(tableName);
      if (!sheet) {
        throw new SSaaDBError(`Table '${tableName}' does not exist.`);
      }

      sheet.appendRow(data);
    }
  
    /**
    * Deletes entries from the specified table that match the filter criteria.
    * @param tableName - The name of the table to delete entries from.
    * @param filterCriteria - An object specifying the filter criteria for deletion.
    * @throws {SSaaDBError} If the table does not exist.
    */
    deleteEntries(tableName: string, filterCriteria: { [header: string]: { operator: string; value: any; }; }): void {
      const sheet = this.spreadsheet.getSheetByName(tableName);
      if (!sheet) {
        throw new SSaaDBError(`Table '${tableName}' does not exist.`);
      }
    
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();
    
      const rowsToDelete = data.reduce((rows, row, index) => {
        const entry = headers.reduce((obj, header, idx) => {
          obj[header] = row[idx];
          return obj;
        }, {});
    
        if (this.matchesFilter(entry, filterCriteria)) {
          rows.push(index + 2);
        }
    
        return rows;
      }, []);

    
      rowsToDelete.reverse().forEach(rowNumber => {
        sheet.deleteRow(rowNumber);
      });
    }
  
    /**
    * Updates entries in the specified table that match the filter criteria with the provided data.
    * @param tableName - The name of the table to update entries in.
    * @param filterCriteria - An object specifying the filter criteria for updating.
    * @param updatedData - An object representing the updated data to apply to matching entries.
    * @throws {SSaaDBError} If the table does not exist.
    */
    updateEntries(tableName: string, filterCriteria: { [header: string]: { operator: string; value: any; }; }, updatedData: { [header: string]: any; }): void {
      const sheet = this.spreadsheet.getSheetByName(tableName);
      if (!sheet) {
        throw new SSaaDBError(`Table '${tableName}' does not exist.`);
      }
    
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();
    
      data.forEach((row, index) => {
        const entry = headers.reduce((obj, header, idx) => {
          obj[header] = row[idx];
          return obj;
        }, {});
    
        if (this.matchesFilter(entry, filterCriteria)) {
          headers.forEach((header, idx) => {
            if (updatedData[header] !== undefined) {
              sheet.getRange(index + 2, idx + 1).setValue(updatedData[header]);
            }
          });
        }
      });
    }
  
    /**
    * Retrieves entries from the specified table that match the filter criteria and selected columns.
    * @param tableName - The name of the table to retrieve entries from.
    * @param filterCriteria - An object specifying the filter criteria for retrieval (optional).
    * @param headers - An array of column names to include in the result (optional).
    * @returns An array of objects representing the retrieved entries.
    * @throws {SSaaDBError} If the table does not exist.
    */
    getEntries(tableName: string, filterCriteria: { [header: string]: { operator: string; value: any; }; } = null, headers: string[] = null): object[] {
      const sheet = this.spreadsheet.getSheetByName(tableName);
      if (!sheet) {
        throw new SSaaDBError(`Table '${tableName}' does not exist.`);
      }

      const data = sheet.getDataRange().getValues();
      const _headers = data.shift();
  
      let entries = data.map(row => {
        return _headers.reduce((obj, _header, index) => {
          obj[_header] = row[index];
          return obj;
        }, {});
      });
  
      if (filterCriteria) {
        entries = entries.filter(entry => this.matchesFilter(entry, filterCriteria));
      }

      if (headers) {
        entries = entries.map(entry => {
          return headers.reduce((obj: { [x: string]: any; }, header: string | number) => {
            obj[header] = entry[header];
            return obj;
          }, {});
        });
      }
  
      return entries;
    }
  
    /**
    * Performs an inner join on two tables based on a join key and retrieves the specified headers.
    * @param table1Name - The name of the first table to join.
    * @param table2Name - The name of the second table to join.
    * @param joinKey - The common key to join the tables on.
    * @param headers - An array of column names to include in the result (optional).
    * @returns An array of objects representing the joined entries with the selected columns.
    */
    joinTables(table1Name: string, table2Name: string, joinKey: string, headers: string[] = null) {
      const table1Entries = headers
        ? this.getEntries(table1Name, null, [joinKey, ...headers.filter((header: string) => header.startsWith(table1Name + '.')).map((header: string) => header.split('.')[1])])
        : this.getEntries(table1Name);
      const table2Entries = headers
        ? this.getEntries(table2Name, null, [joinKey, ...headers.filter((header: string) => header.startsWith(table2Name + '.')).map((header: string) => header.split('.')[1])])
        : this.getEntries(table2Name);
  
      const joinedEntries = table1Entries.map(entry1 => {
        const entry2 = table2Entries.find(entry => entry[joinKey] === entry1[joinKey]);
        return { ...entry1, ...entry2 };
      });
  
      if (headers) {
        const selectedHeaders = headers.map((header: string) => header.split('.')[1]);
        return joinedEntries.map(entry => {
          return selectedHeaders.reduce((obj: { [x: string]: any; }, header: string | number) => {
            obj[header] = entry[header];
            return obj;
          }, {});
        });
      }
  
      return joinedEntries;
    }
  
    /**
    * Retrieves the headers (column names) of the specified table.
    * @param tableName - The name of the table to retrieve headers from.
    * @returns An array of strings representing the table headers.
    * @throws {SSaaDBError} If the table does not exist.
    */
    getHeaders(tableName: string): string[] {
      const sheet = this.spreadsheet.getSheetByName(tableName);
      if (!sheet) {
        throw new SSaaDBError(`Table '${tableName}' does not exist.`);
      }

      const headers = sheet.getDataRange().getValues().shift();
      return headers;
    }
  
    /**
    * Counts the number of entries in the specified table.
    * @param tableName - The name of the table to count entries in.
    * @returns The number of entries in the table.
    * @throws {SSaaDBError} If the table does not exist.
    */
    countEntries(tableName: string): number {
      const sheet = this.spreadsheet.getSheetByName(tableName);
      if (!sheet) {
        throw new SSaaDBError(`Table '${tableName}' does not exist.`);
      }

      const rowCount = sheet.getLastRow() - 1;
      return rowCount;
    }
  
    /**
    * Clears all data from the specified table, keeping the headers intact.
    * @param tableName - The name of the table to clear.
    * @throws {SSaaDBError} If the table does not exist.
    */
    clearTable(tableName: string): void {
      const sheet = this.spreadsheet.getSheetByName(tableName);
      if (!sheet) {
        throw new SSaaDBError(`Table '${tableName}' does not exist.`);
      }

      const dataRange = sheet.getDataRange();
      const numRows = dataRange.getNumRows();
      const numColumns = dataRange.getNumColumns();
      sheet.getRange(2, 1, numRows - 1, numColumns).clearContent();
    }

    private matchesFilter(entry: { [key: string]: any }, filterCriteria: { [header: string]: { operator: string; value: any; } }): boolean {
      return Object.keys(filterCriteria).every(key => {
        const { operator, value } = filterCriteria[key];
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
            throw new SSaaDBError(`Invalid operator: ${operator}`);
        }
      });
    }
  }
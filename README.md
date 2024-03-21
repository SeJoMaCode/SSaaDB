# SSaaDB - Spreadsheet as a Database

SSaaDB is a Google Apps Script library that allows you to use a Google Spreadsheet as a simple database. It provides an easy-to-use API for creating tables, inserting entries, querying data, and performing various database operations.

## Features

- Create and delete tables
- Insert and delete entries
- Update entries based on filter criteria
- Retrieve entries with optional filtering and column selection
- Perform inner joins on tables
- Get table headers and count entries
- Clear table data

## Installation

1. Clone the repository or download the source code.
2. Open your Google Apps Script project.
3. Copy the contents of `SSaaDB.gs` into your project.

## Usage
Currently you must manually make a new Google sheet and and copy the id from it.

```javascript
// Create a new instance of SSaaDB
const db = new SSaaDB('YOUR_SPREADSHEET_ID');

// Create a new table
db.createTable('users', ['id', 'name', 'email']);

// Insert entries into the table
db.insertEntry('users', [1, 'John Doe', 'john@example.com']);
db.insertEntry('users', [2, 'Jane Smith', 'jane@example.com']);

// Retrieve entries from the table
const users = db.getEntries('users');
console.log(users);

// Update entries based on filter criteria
db.updateEntries('users', { id: { operator: '==', value: 1 } }, { email: 'john.doe@example.com' });

// Delete entries based on filter criteria
db.deleteEntries('users', { id: { operator: '==', value: 2 } });

// Join tables based on a common key
db.createTable('orders', ['id', 'userId', 'product']);
db.insertEntry('orders', [1, 1, 'Product A']);
db.insertEntry('orders', [2, 1, 'Product B']);

const joinedData = db.joinInner('users', 'orders', 'id', ['users.name', 'orders.product']);
console.log(joinedData);
```

## Roadmap

- Automatic creation/detection of Spreadsheets(databases)
- True primary and foreign keys
- Optimize update and deletion by doing it in bulk
- Filter entries with getRange() instead of getting all values then filtering
- Use a pagination system for getEntries for the case of larger tables
    - This will cause joinInner to need to be reworked
- Handle concurrent access to the database
- Ability to do other types of joins


## API Reference

### `constructor(spreadsheetId: string)`
Creates a new instance of SSaaDB.
- `spreadsheetId`: The ID of the Google Spreadsheet to use as the database.

### `createTable(tableName: string, headers: string[]): void`
Creates a new table with the specified name and headers.
- `tableName`: The name of the table to create.
- `headers`: An array of column headers for the table.

### `deleteTable(tableName: string): void`
Deletes the specified table.
- `tableName`: The name of the table to delete.

### `getTables(): string[]`
Retrieves the names of all tables in the database.
- Returns an array of table names.

### `renameTable(oldTableName: string, newTableName: string): void`
Renames the specified table.
- `oldTableName`: The current name of the table.
- `newTableName`: The new name for the table.

### `copyTable(sourceTableName: string, destinationTableName: string): void`
Copies the source table to a new table with the specified name.
- `sourceTableName`: The name of the source table to copy.
- `destinationTableName`: The name of the new table to create.

### `insertEntry(tableName: string, data: any[]): void`
Inserts a new entry into the specified table.
- `tableName`: The name of the table to insert the entry into.
- `data`: An array of values representing the entry data.

### `deleteEntries(tableName: string, filterCriteria: { [header: string]: { operator: string; value: any; }; }): void`
Deletes entries from the specified table that match the filter criteria.
- `tableName`: The name of the table to delete entries from.
- `filterCriteria`: An object specifying the filter criteria for deletion.

### `updateEntries(tableName: string, filterCriteria: { [header: string]: { operator: string; value: any; }; }, updatedData: { [header: string]: any; }): void`
Updates entries in the specified table that match the filter criteria with the provided data.
- `tableName`: The name of the table to update entries in.
- `filterCriteria`: An object specifying the filter criteria for updating.
- `updatedData`: An object representing the updated data to apply to matching entries.

### `getEntries(tableName: string, filterCriteria?: { [header: string]: { operator: string; value: any; }; }, headers?: string[]): object[]`
Retrieves entries from the specified table that match the filter criteria and selected columns.
- `tableName`: The name of the table to retrieve entries from.
- `filterCriteria` (optional): An object specifying the filter criteria for retrieval.
- `headers` (optional): An array of column names to include in the result.
- Returns an array of objects representing the retrieved entries.

### `joinInner(table1Name: string, table2Name: string, joinKey: string, headers?: string[]): object[]`
Performs an inner join on two tables based on a join key and retrieves the specified headers.
- `table1Name`: The name of the first table to join.
- `table2Name`: The name of the second table to join.
- `joinKey`: The common key to join the tables on.
- `headers` (optional): An array of column names to include in the result.
- Returns an array of objects representing the joined entries with the selected columns.

### `getHeaders(tableName: string): string[]`
Retrieves the headers (column names) of the specified table.
- `tableName`: The name of the table to retrieve headers from.
- Returns an array of strings representing the table headers.

### `countEntries(tableName: string): number`
Counts the number of entries in the specified table.
- `tableName`: The name of the table to count entries in.
- Returns the number of entries in the table.

### `clearTable(tableName: string): void`
Clears all data from the specified table, keeping the headers intact.
- `tableName`: The name of the table to clear.

## Error Handling

SSaaDB defines a custom error class `SSaaDBError` for handling specific errors related to database operations. The library throws instances of this error class when appropriate, providing meaningful error messages.

## License

This project is licensed under the [MIT License](LICENSE).
function testSSaaDB() {
    const db = new SSaaDB(PropertiesService.getScriptProperties().getProperty('SpreadSheet_ID'));
  
    // Test createTable
    db.createTable('TestTable1', ['ID', 'Name', 'Age']);
    db.createTable('TestTable2', ['ID', 'City']);
    if (!db.spreadsheet.getSheetByName('TestTable1') || !db.spreadsheet.getSheetByName('TestTable2')) {
      throw new Error('Failed to create tables');
    }
  
    // Test insertEntry
    db.insertEntry('TestTable1', [1, 'John', 25]);
    db.insertEntry('TestTable1', [2, 'Alice', 30]);
    db.insertEntry('TestTable2', [1, 'New York']);
    db.insertEntry('TestTable2', [2, 'London']);
  
    // Test getEntries
    const entries1 = db.getEntries('TestTable1');
    if (entries1.length !== 2 || entries1[0]['ID'] !== 1 || entries1[0]['Name'] !== 'John' || entries1[0]['Age'] !== 25) {
      throw new Error('Failed to get entries');
    }
  
    // Test updateEntries
    db.updateEntries('TestTable1', { ID: { operator: '==', value: 1 } }, { Age: 26 });
    const updatedEntries1 = db.getEntries('TestTable1', { ID: { operator: '==', value: 1 } });
    if (updatedEntries1[0]['Age'] !== 26) {
      throw new Error('Failed to update entries');
    }
  
    // Test deleteEntries
    db.deleteEntries('TestTable1', { ID: { operator: '==', value: 1 } });
    const entriesAfterDelete = db.getEntries('TestTable1');
    if (entriesAfterDelete.length !== 1) {
      throw new Error('Failed to delete entries');
    }
  
    // Test joinInner
    const joinedEntries = db.joinInner('TestTable1', 'TestTable2', 'ID');
    if (joinedEntries.length !== 1 || joinedEntries[0]['ID'] !== 2 || joinedEntries[0]['Name'] !== 'Alice' || joinedEntries[0]['City'] !== 'London') {
      throw new Error('Failed to join tables');
    }
  
    // Test getHeaders
    const headers1 = db.getHeaders('TestTable1');
    if (headers1[0] !== 'ID' || headers1[1] !== 'Name' || headers1[2] !== 'Age') {
      throw new Error('Failed to get headers');
    }
  
    // Test countEntries
    const count1 = db.countEntries('TestTable1');
    if (count1 !== 1) {
      throw new Error('Failed to count entries');
    }
  
    // Test clearTable
    db.clearTable('TestTable1');
    const entriesAfterClear = db.getEntries('TestTable1');
    if (entriesAfterClear.length !== 0) {
      throw new Error('Failed to clear table');
    }
  
    // Test deleteTable
    db.deleteTable('TestTable1');
    db.deleteTable('TestTable2');
    if (db.spreadsheet.getSheetByName('TestTable1') || db.spreadsheet.getSheetByName('TestTable2')) {
      throw new Error('Failed to delete tables');
    }
  
    console.log('All tests passed!');
  }
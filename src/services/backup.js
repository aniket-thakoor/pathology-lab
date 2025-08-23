import Dexie from 'dexie';
import { exportDB, importDB, importInto } from 'dexie-export-import';

const DB_NAME = 'PathoReportDB';

// Open your IndexedDB in dynamic mode
async function openAppDB() {
  const db = new Dexie(DB_NAME);
  await db.open();
  return db;
}

// Create and download a backup
export async function backupNow() {
  const db = await openAppDB();
  const blob = await exportDB(db);
  const filename = `${DB_NAME}-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

  // Trigger file download
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);

  return { filename, blob };
}

// Restore from selected file
export async function restoreFromFile(file, strategy = 'merge') {
  if (!file) throw new Error('No file provided');

  if (strategy === 'replace') {
    const db = await openAppDB();
    await db.delete();
    await importDB(file);
  } else {
    const db = await openAppDB();
    await importInto(db, file, {
      overwriteValues: true // skips records with existing keys
    });
  }
}

// Share latest backup by creating it fresh
export async function shareLatestNow() {
  const db = await openAppDB();
  const blob = await exportDB(db);
  const file = new File(
    // json is not supported in Share hence using text format for sharing
    [blob], `${DB_NAME}-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`, { type: 'text/plain' }
  );

  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    await navigator.share({
      title: 'IndexedDB Backup',
      text: 'Here is my latest backup.',
      files: [file],
    });
  } else {
    // Fallback download if sharing not supported
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  }
}


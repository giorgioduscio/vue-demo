import { test, expect } from 'playwright/test';

// --- Dati di Test e Variabili Globali ---
// ID univoco per evitare conflitti nei dati di test
const sectionId = Math.floor(Math.random() * 9999);

// Dati per la compilazione del form di registrazione
const compilators = [
  { key: 'username', value: `test${sectionId}` },
  { key: 'email', value: `test${sectionId}@gmail.com` },
  { key: 'password', value: 'testtest019283' },
  { key: 'suggestion', value: 'testtest019283' },
  { key: 'role', value: '0' },
];

// Credenziali per il login (email e password)
const userCredentials = compilators.filter(
  (comp) => comp.key === 'email' || comp.key === 'password'
);

// --- Funzioni di Utilità ---

/**
 * Compila i campi di un form in base ai dati forniti.
 * @param {import('playwright').Page} page - Pagina Playwright.
 * @param {Array<{ key: string, value: string }>} fields - Campi da compilare.
 */
async function fillForm(page, fields) {
  for (const { key, value } of fields) {
    const input = page.locator(`[name="${key}"]`);
    const tagName = await input.evaluate((el) => el.tagName);

    if (tagName === 'SELECT') {
      await input.selectOption({ value });
    } else {
      await input.fill(value);
    }

    const inputName = await input.getAttribute('name');
    const inputValue = await input.inputValue();
    console.log(`\t> ${inputName} =`, inputValue);
  }
}

/**
 * Esegue il login dell'utente.
 * @param {import('playwright').Page} page - Pagina Playwright.
 */
async function login(page) {
  // Naviga alla pagina di accesso
  await page.goto('http://localhost:5173/access');
  console.log('\t', await page.locator('h1').textContent());

  // Attende che il form sia caricato
  await page.waitForSelector('form');

  // Compila il form con le credenziali
  await fillForm(page, userCredentials);

  // Invia il form
  await page.click('button[type="submit"]');

  // Attende la reindirizzazione alla pagina utenti
  await page.waitForURL('**/users');
  console.log('\tLogin effettuato con successo.');
}

// --- Suite di Test per il CRUD degli Utenti ---
test.describe.serial('CRUD Utenti', () => {
  // Test per la creazione di un nuovo utente
  test('CREATE: dovrebbe registrare un nuovo utente', async ({ page }) => {
    console.log('--- CREATE ---');

    // Naviga alla pagina di registrazione
    await page.goto('http://localhost:5173/register');
    console.log('\t', await page.locator('h1').textContent());

    // Attende che il form sia caricato
    await page.waitForSelector('form');

    // Compila il form con i dati di test
    await fillForm(page, compilators);

    // Invia il form
    await page.click('button[type="submit"]');

    // Verifica che non ci siano errori di validazione
    const errorCount = await page.locator('.is-invalid').count();
    expect(errorCount).toBe(0);

    // Verifica che venga visualizzata la notifica di successo
    await expect(page.locator('.toast-notification')).toBeVisible();
    console.log('\tRegistrazione completata con successo.');
  });

  // Test per la ricerca dell'utente appena creato
  test('READ: dovrebbe trovare l\'utente appena creato', async ({ page }) => {
    console.log('\n--- READ ---');

    // Esegue il login
    await login(page);

    // Verifica il titolo della pagina
    console.log('\t', await page.locator('h1').textContent());

    // Filtra gli utenti per username
    const targetUsername = compilators.find((comp) => comp.key === 'username').value;
    const filterInput = page.locator('[name="filter"]');
    await filterInput.fill(targetUsername);
    console.log(`\t> filter =`, await filterInput.inputValue());

    // Verifica che venga trovato un solo utente
    const rows = page.locator('tbody tr');
    const firstRow = rows.first();
    const firstInput = firstRow.locator('input[name*="username"]');

    await expect(rows).toHaveCount(1);
    await expect(firstInput).toHaveValue(targetUsername);
    console.log('\tRicerca utente completata con successo.');
  });

  // Test per l'aggiornamento dello username dell'utente
  test('UPDATE: dovrebbe aggiornare lo username dell\'utente', async ({ page }) => {
    console.log('\n--- UPDATE ---');

    // Esegue il login
    await login(page);

    // Verifica il titolo della pagina
    console.log('\t', await page.locator('h1').textContent());

    // Filtra gli utenti per username
    const oldUsername = compilators.find((comp) => comp.key === 'username').value;
    const filterInput = page.locator('[name="filter"]');
    await filterInput.fill(oldUsername);
    console.log(`\t> filter =`, await filterInput.inputValue());

    // Verifica che venga trovato un solo utente
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);

    // Trova la riga dell'utente e aggiorna lo username
    const userRow = rows.first();
    const usernameInput = userRow.locator('[name*="username"]');
    const inputValue = await usernameInput.inputValue();
    const newUsername = inputValue.toUpperCase();

    await usernameInput.fill(newUsername);
    await expect(usernameInput).toHaveValue(newUsername);
    console.log('\t> username aggiornato a:', newUsername);
  });

  // Test per l'eliminazione dell'utente
  test('DELETE: dovrebbe eliminare l\'utente', async ({ page }) => {
    console.log('\n--- DELETE ---');

    // Esegue il login
    await login(page);

    // Verifica il titolo della pagina
    console.log('\t', await page.locator('h1').textContent());

    // Filtra gli utenti per username
    const targetUsername = compilators.find((comp) => comp.key === 'username').value;
    const filterInput = page.locator('[name="filter"]');
    await filterInput.fill(targetUsername);
    console.log(`\t> filter =`, await filterInput.inputValue());

    // Verifica che venga trovato un solo utente
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);

    // Trova l'utente da eliminare
    const userRow = rows.first();
    const usernameInput = userRow.locator('[name*="username"]');
    const inputValue = await usernameInput.inputValue();    
    await expect(inputValue).toBe(targetUsername);
    console.log('\t> Tentativo di eliminazione utente:', targetUsername);

    // Clicca sul pulsante di eliminazione
    const deleteButton = userRow.locator('.btn-danger');
    await deleteButton.click();

    // Conferma l'eliminazione
    await page.waitForSelector('#agree-ok');
    await page.click('#agree-ok');

    // Verifica che l'utente non sia più visibile
    await expect(rows).toHaveCount(0);
    console.log('\t> Utente eliminato con successo:', targetUsername);
  });
});

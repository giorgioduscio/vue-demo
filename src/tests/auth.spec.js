import { test, expect } from 'playwright/test';

// Dati comuni per i test
const compilators =  [
  { key: 'username', value: 'test' },
  { key: 'email', value: 'test@gmail.com' },
  { key: 'password', value: 'testtest019283' },
  { key: 'suggestion', value: 'testtest019283' },
]

// Funzione comune per compilare il form
async function fillForm(page, fields) {
  for (const comp of fields) {
    const input = page.locator(`[name="${comp.key}"]`);
    await input.fill(comp.value);
    const inputName = await input.getAttribute('name');
    const inputValue = await input.inputValue();
    console.log(`\t> ${inputName} =`, inputValue);
  }
}

test.describe('Auth', () => {
  test('Registrazione', async ({ page }) => {
    await page.goto('http://localhost:5173/register');

    // Verifica che il form sia caricato
    await page.waitForSelector('form');

    // Compila i campi del form (registrazione)
    await fillForm(page, compilators);

    // Invia il form
    await page.click('button[type="submit"]');

    // Verifica assenza di errori
    const errorsFeedbacks = await page.locator('.is-invalid').count();
    console.log(`\t> errorsFeedbacks =`, errorsFeedbacks);
    expect(errorsFeedbacks).toBe(0);
  });

  test('Accesso', async ({ page }) => {
    await page.goto('http://localhost:5173/access');

    // Verifica che il form sia caricato
    await page.waitForSelector('form');

    // Compila i campi del form (accesso)
    const accessFields = compilators.filter(comp => comp.key =='email' || comp.key =='password');
    await fillForm(page, accessFields);

    // Invia il form
    await page.click('button[type="submit"]');

    // Verifica assenza di errori
    const errorsFeedbacks = await page.locator('.is-invalid').count();
    console.log(`\t> errorsFeedbacks =`, errorsFeedbacks);
    expect(errorsFeedbacks).toBe(0);
  });
});

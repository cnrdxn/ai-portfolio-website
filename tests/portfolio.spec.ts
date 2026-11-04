import { expect, test } from '@playwright/test';

const projectTitles = [
  'Enterprise AI Answers Service',
  'Iterative Topic Resolver',
  'WiFi Sharing Fraud Detection',
  'House Butler',
];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('shows the main portfolio heading and four projects', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'BUILDING AI PRODUCTS. FROM IDEA TO LAUNCH.' })).toBeVisible();

  const projectButtons = page.getByRole('button', { name: /Open .* project details/ });
  await expect(projectButtons).toHaveCount(4);
  for (const title of projectTitles) {
    await expect(page.getByRole('button', { name: `Open ${title} project details` })).toBeVisible();
  }
});

test('each project opens its project modal, focuses close, and restores focus after Escape', async ({ page }) => {
  for (const title of projectTitles) {
    const projectButton = page.getByRole('button', { name: `Open ${title} project details` });
    await projectButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { level: 2, name: title })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close project details' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(projectButton).toBeFocused();
  }
});

test('clicking the modal backdrop dismisses the project details', async ({ page }) => {
  await page.getByRole('button', { name: 'Open Enterprise AI Answers Service project details' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.locator('.modal-backdrop').click({ position: { x: 8, y: 8 } });
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('contact links point to the supplied email and LinkedIn profile', async ({ page }) => {
  const emailLinks = page.locator('a[href^="mailto:"]');
  const linkedInLinks = page.locator('a[href*="linkedin.com"]');

  expect(await emailLinks.count()).toBeGreaterThan(0);
  for (let index = 0; index < await emailLinks.count(); index += 1) {
    await expect(emailLinks.nth(index)).toHaveAttribute('href', 'mailto:comms@connorddixon.com');
  }

  expect(await linkedInLinks.count()).toBeGreaterThan(0);
  for (let index = 0; index < await linkedInLinks.count(); index += 1) {
    await expect(linkedInLinks.nth(index)).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/connorddixon/',
    );
  }
});

test('shows the section order and keeps the hero footer below its content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.hero-description')).toContainText('I’m Connor. I build AI-powered products');
  await expect(page.locator('.hero-highlight')).toHaveCount(4);
  expect(await page.locator('main > section').evaluateAll(sections => sections.map(section => section.id)))
    .toEqual(['top', 'overview', 'work', 'experience', 'about', 'contact']);
  const panel = await page.locator('.capability-popover').boundingBox();
  const location = await page.locator('.hero-bottom').boundingBox();
  expect(location!.y).toBeGreaterThan(panel!.y + panel!.height);
});

test('mobile navigation opens and closes after navigating to About', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const menuToggle = page.getByRole('button', { name: 'Open navigation' });
  await menuToggle.click();
  await expect(page.getByRole('button', { name: 'Close navigation' })).toHaveAttribute('aria-expanded', 'true');

  const mobileNavigation = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(mobileNavigation).toBeVisible();
  await mobileNavigation.getByRole('link', { name: 'About', exact: true }).click();

  await expect(page).toHaveURL(/#about$/);
  await expect(mobileNavigation).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
});

test('desktop and mobile layouts have no horizontal overflow after fonts load', async ({ page }) => {
  for (const width of [1440, 390, 360]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.screenshot({ path: `test-results/portfolio-${width}.png`, fullPage: true });

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));

    expect(dimensions.document, `document overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.body, `body overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
    const headingFits = await page.locator('.hero-title-line').evaluateAll(elements => elements.every(element => {
      const line = element.getBoundingClientRect();
      const column = element.closest('.hero-title')!.getBoundingClientRect();
      return line.left >= column.left - 1 && line.right <= column.right + 1;
    }));
    expect(headingFits, `headline clipped at ${width}px`).toBe(true);
  }
});

test('capability neurons rotate continuously and their connectors follow them', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const neuron = page.locator('[data-capability-neuron="0"]');
  const firstPosition = await neuron.getAttribute('transform');
  await expect.poll(() => neuron.getAttribute('transform')).not.toBe(firstPosition);
  await page.getByRole('button', { name: 'Explore AI systems', exact: true }).hover();
  const panel = page.getByRole('complementary', { name: 'AI systems experience' });
  await expect(panel).toBeVisible();
  await expect(panel.locator('.capability-pills > span')).toHaveCount(3);
  const diagramBounds = await page.locator('.system-diagram').boundingBox();
  const panelBounds = await panel.boundingBox();
  const actionBounds = await page.locator('.hero-actions').boundingBox();
  expect(panelBounds!.y).toBeGreaterThanOrEqual(actionBounds!.y + actionBounds!.height);
  expect(Math.abs(panelBounds!.x - actionBounds!.x)).toBeLessThan(1);
  await expect(page.locator('.system-diagram > title')).toHaveCount(0);
  expect(panelBounds!.x + panelBounds!.width <= diagramBounds!.x || panelBounds!.x >= diagramBounds!.x + diagramBounds!.width).toBe(true);
  await page.screenshot({ path: 'test-results/capability-detail.png' });
  const activePosition = await neuron.getAttribute('transform');
  await expect.poll(() => neuron.getAttribute('transform')).not.toBe(activePosition);
  const largestGap = await page.locator('.system-diagram').evaluate(svg => {
    return Math.max(...Array.from(svg.querySelectorAll<SVGGElement>('[data-capability-neuron]')).map(node => {
      const index = node.dataset.capabilityNeuron;
      const connector = svg.querySelector<SVGPathElement>(`[data-capability-connector="${index}"]`)!;
      const matrix = node.transform.baseVal.consolidate()!.matrix;
      const endpoint = connector.getPointAtLength(connector.getTotalLength());
      return Math.hypot(endpoint.x - matrix.e, endpoint.y - matrix.f);
    }));
  });
  expect(largestGap).toBeLessThan(0.1);
});

test('each capability opens the same detail panel from its label and its neuron', async ({ page }) => {
  const labels = page.locator('[data-capability-label]');
  const neurons = page.locator('[data-capability-neuron]');
  await expect(labels).toHaveCount(10);
  await expect(neurons).toHaveCount(10);
  for (let index = 0; index < 10; index++) {
    await labels.nth(index).hover();
    const panel = page.locator('.capability-popover:not(.capability-popover--prompt)');
    await expect(panel).toBeVisible();
    const title = await panel.locator('h3').innerText();
    await expect(panel.locator('.capability-pills > span')).toHaveCount(3);
    const examples = panel.getByRole('list', { name: `${title} examples` }).getByRole('listitem');
    await expect(examples).toHaveCount(2);
    const exampleText = await examples.allTextContents();
    for (const example of await examples.all()) await expect(example).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await neurons.nth(index).hover();
    await expect(panel.locator('h3')).toHaveText(title);
    await expect(panel.getByRole('listitem')).toHaveText(exampleText);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  }
});

test('capability details support keyboard and mobile tap', async ({ page }) => {
  const label = page.getByRole('button', { name: 'Explore Visual design', exact: true });
  await label.focus();
  await expect(page.getByRole('complementary', { name: 'Visual design experience' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.capability-popover:not(.capability-popover--prompt)')).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Explore Data science', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'Data science experience' });
  await expect(panel).toBeVisible();
  const bounds = await panel.boundingBox();
  const actionBounds = await page.locator('.hero-actions').boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(actionBounds!.y + actionBounds!.height);
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Close capability details' }).click();
  await expect(panel).toBeHidden();
});

test('capability evidence links reach the exact project or experience on desktop and mobile', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [capability, name, target] of [
      ['AI systems', 'Enterprise AI Answers Service', 'project-enterprise-ai'],
      ['AI systems', 'Iterative Topic Resolver', 'project-iterative-topic-resolver'],
      ['Data science', 'WiFi Sharing Fraud Detection', 'project-wifi-fraud-detection'],
      ['Data science', 'Data pipelines and forecasting', 'experience-data-science'],
      ['Software engineering', 'House Butler', 'project-house-butler'],
    ]) {
      await page.goto('/');
      await page.getByRole('button', { name: `Explore ${capability}`, exact: true }).click();
      const panel = page.getByRole('complementary', { name: `${capability} experience` });
      await panel.getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${target}$`));
      await expect.poll(() => page.locator(`#${target}`).evaluate(element => {
        const rect = element.getBoundingClientRect();
        return rect.top >= document.querySelector('header')!.getBoundingClientRect().bottom && rect.top < innerHeight;
      })).toBe(true);
      if (target.startsWith('project-')) {
        await page.locator(`#${target}`).press('Enter');
        await expect(page.getByRole('dialog').getByRole('heading', { name, exact: true })).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
  }
});

test('orb supports dragging and release outside its bounds, then resumes idle motion', async ({ page }) => {
  const orb = page.locator('[data-orb-mode]');
  const neuron = page.locator('[data-capability-neuron="0"]');
  const surface = page.locator('[data-orb-mode] > .neural-hit-area');
  const bounds = (await surface.boundingBox())!;
  const initialPosition = await neuron.getAttribute('transform');
  await page.mouse.move(bounds.x + bounds.width * 0.4, bounds.y + bounds.height * 0.5);
  await page.mouse.down();
  await expect(orb).toHaveAttribute('data-orb-mode', 'dragging');
  await page.mouse.move(bounds.x + bounds.width * 0.75, bounds.y + bounds.height * 0.25, { steps: 8 });
  expect(await neuron.getAttribute('transform')).not.toBe(initialPosition);
  await page.mouse.move(bounds.x + bounds.width + 50, bounds.y + bounds.height * 0.2, { steps: 4 });
  await page.mouse.up();
  await expect(orb).toHaveAttribute('data-orb-mode', 'reduced-motion');
  const releasedPosition = await neuron.getAttribute('transform');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(orb).toHaveAttribute('data-orb-mode', 'idle');
  await expect.poll(() => neuron.getAttribute('transform')).not.toBe(releasedPosition);
});


test('orb starts with an invitation and remembers the last capability after pointer exit', async ({ page }) => {
  const prompt = page.getByRole('complementary', { name: 'Explore the orb', exact: true });
  await expect(prompt.getByRole('heading', { name: 'Explore how I build.' })).toBeVisible();
  await page.getByRole('button', { name: 'Explore AI systems', exact: true }).hover();
  await expect(prompt).toBeHidden();
  const selected = page.getByRole('complementary', { name: 'AI systems experience' });
  await expect(selected).toBeVisible();
  await page.mouse.move(0, 0);
  // Wait beyond the old hover dismissal delay to verify persistent selection.
  await page.waitForTimeout(750);
  await expect(selected).toBeVisible();
  await page.getByRole('button', { name: 'Explore Data science', exact: true }).hover();
  await expect(selected).toBeHidden();
  await expect(page.getByRole('complementary', { name: 'Data science experience' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(prompt).toBeVisible();
});

test('every section stays visible while scrolling and after reveal classes change', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const id of ['overview', 'work', 'experience', 'about', 'contact']) {
    const section = page.locator(`main > section#${id}`);
    await section.scrollIntoViewIfNeeded();
    await expect.poll(() => section.locator('.reveal').evaluateAll(elements =>
      elements.every(element => Number(getComputedStyle(element).opacity) >= 0.99),
    )).toBe(true);
    await section.screenshot({ path: `test-results/section-${id}.png` });
  }
  // Fast Refresh can replace classes on elements the observer has already seen.
  await page.locator('.reveal').evaluateAll(elements => elements.forEach(element => element.classList.remove('is-visible')));
  expect(await page.locator('.reveal').evaluateAll(elements =>
    elements.every(element => getComputedStyle(element).opacity === '1'),
  )).toBe(true);
});


test('header remains visible and section links scroll below it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');
  for (const [label, id] of [['Overview', 'overview'], ['Work', 'work'], ['Experience', 'experience'], ['About', 'about'], ['Contact', 'contact']]) {
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect.poll(async () => {
      const target = await page.locator(`section#${id}`).boundingBox();
      const header = await page.locator('.site-header').boundingBox();
      return !!target && !!header && Math.abs(header.y) < 1 && target.y >= header.height - 1 && target.y < 500;
    }).toBe(true);
  }
});


test('hero shows the updated headline and section subtitles sit below titles', async ({ page }) => {
  await expect(page.locator('.hero-title-line')).toHaveText(['BUILDING AI PRODUCTS.', 'FROM IDEA TO LAUNCH.']);
  for (const [id, subtitle] of [['overview', '.section-description'], ['work', '.section-heading > p'], ['experience', '.section-heading > p'], ['contact', '.contact-description']]) {
    const section = page.locator(`section#${id}`);
    await section.scrollIntoViewIfNeeded();
    const heading = (await section.getByRole('heading', { level: 2 }).boundingBox())!;
    const description = (await section.locator(subtitle).boundingBox())!;
    expect(description.y).toBeGreaterThanOrEqual(heading.y + heading.height);
    expect(Math.abs(description.x - heading.x)).toBeLessThan(1);
  }
});

for (const fallbackFonts of [false, true]) {
  test(`capability panel follows the orb only on mobile${fallbackFonts ? ' with fallback fonts' : ''}`, async ({ page }) => {
    if (fallbackFonts) {
      await page.addStyleTag({ content: '.hero-grid * { font-family: Arial, sans-serif !important; }' });
    }
    for (const width of [360, 390, 760, 1440]) {
      await test.step(`${width}px viewport`, async () => {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(() => document.fonts.ready.then(() => undefined));
        // Read every rectangle in one browser frame. Separate round trips can
        // mix layouts from before and after responsive font loading/reflow.
        await expect.poll(() => page.evaluate(() => {
          const visual = document.querySelector('.hero-visual')!.getBoundingClientRect();
          const panel = document.querySelector('#capability-details')!.getBoundingClientRect();
          const actions = document.querySelector('.hero-actions')!.getBoundingClientRect();
          if (window.innerWidth <= 760) {
            return {
              panelPlacedCorrectly: panel.top >= visual.bottom - 1,
              orbPlacedCorrectly: visual.top >= actions.bottom - 1,
            };
          }
          return {
            panelPlacedCorrectly: panel.right <= visual.left + 1,
            orbPlacedCorrectly: panel.top > actions.top,
          };
        }), { message: `Hero layout at ${width}px` }).toEqual({
          panelPlacedCorrectly: true,
          orbPlacedCorrectly: true,
        });
      });
    }
  });
}

test('mobile projects have borders and vertically centered scrollable dialogs', async ({ page }) => {
  for (const width of [360, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const cards = page.locator('.project-grid .project-card');
    await expect(cards).toHaveCount(4);
    for (const card of await cards.all()) {
      expect(await card.evaluate(el => getComputedStyle(el).borderTopStyle)).toBe('solid');
      await card.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect.poll(async () => {
        const bounds = (await dialog.boundingBox())!;
        return Math.abs(bounds.y + bounds.height / 2 - 422);
      }).toBeLessThan(2);
      expect(await dialog.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
      await page.getByRole('button', { name: 'Close project details' }).click();
    }
  }
});

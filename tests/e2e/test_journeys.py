"""Real Chromium journeys through the UI, on a phone-sized screen."""

# pytest injects fixtures by name.
# pylint: disable=redefined-outer-name,missing-function-docstring

import re

import pytest
from playwright.sync_api import Page, expect

pytestmark = pytest.mark.e2e

PHONE = {"width": 390, "height": 844}


@pytest.fixture
def phone(page: Page, site, errors):
    page.set_viewport_size(PHONE)
    page.goto(f"{site}/?debug")
    yield page
    assert not errors, errors


def start_case(page: Page, number: int = 1):
    page.get_by_role("button", name=re.compile("Play|Continue")).click()
    page.locator(".case-item").nth(number - 1).click()
    expect(page.locator("#chart-title")).to_be_visible()
    page.get_by_role("button", name="Begin appointment").click()
    expect(page.locator("#hud")).to_be_visible()


def answer_quiz(page: Page):
    for _ in range(3):
        page.locator("#answers button").first.click()
        page.locator("#quiz-next").click()


def test_easy_case_from_chart_to_saved_results(phone: Page):
    expect(phone.get_by_role("heading", name=re.compile("PLAQUE"))).to_be_visible()
    start_case(phone)
    phone.evaluate("PA.winNow()")
    expect(phone.locator("#proc-h")).to_have_text("How the real appointment goes")
    expect(phone.locator("#steps li")).to_have_count(8)
    phone.get_by_role("button", name="Continue to quiz").click()
    expect(phone.locator("#quiz-count")).to_contain_text("Question 1 of 3")
    answer_quiz(phone)
    expect(phone.locator("#results-h")).to_have_text("Checkup Day: treated!")
    expect(phone.locator("#results-stars")).to_contain_text("★")

    phone.reload()
    phone.get_by_role("button", name="Continue").click()
    expect(phone.locator(".case-item").nth(0)).to_contain_text("★")
    expect(phone.locator(".case-item").nth(1)).to_be_enabled()
    expect(phone.locator(".case-item").nth(2)).to_be_disabled()


def test_pro_mode_orders_the_real_procedure(phone: Page):
    phone.locator('input[name="mode"][value="pro"]').check()
    steps = phone.evaluate(
        "import('/js/data/cases.js').then(m => m.CASES[0].steps.map(s => s.pro))"
    )
    start_case(phone)
    phone.evaluate("PA.winNow()")
    expect(phone.locator("#proc-h")).to_have_text("Put the treatment in order")
    for label in steps:
        phone.locator("#step-pool button", has_text=label).click()
    phone.get_by_role("button", name="Check order").click()
    expect(phone.locator("#proc-feedback")).to_have_text("Perfect sequence! ⭐")
    phone.get_by_role("button", name="Continue to quiz").click()
    expect(phone.locator("#quiz-count")).to_contain_text("Dental Pro")
    answer_quiz(phone)
    expect(phone.locator("#results-list")).to_contain_text("Procedure order")


def test_wrong_order_shows_corrections(phone: Page):
    phone.locator('input[name="mode"][value="pro"]').check()
    start_case(phone)
    phone.evaluate("PA.winNow()")
    expect(phone.locator("#proc-h")).to_have_text("Put the treatment in order")
    pool = phone.locator("#step-pool button")
    for _ in range(pool.count()):
        phone.locator("#step-pool button:visible").last.click()
    phone.get_by_role("button", name="Check order").click()
    expect(phone.locator("#steps li.bad").first).to_contain_text("should be")


def test_level_up_choice_adds_an_instrument(phone: Page):
    start_case(phone, 1)
    phone.evaluate("PA.levelUpNow()")
    expect(phone.locator("#levelup")).to_be_visible()
    expect(phone.locator(".choice")).to_have_count(3)
    phone.locator(".choice").first.click()
    expect(phone.locator("#levelup")).to_be_hidden()
    expect(phone.locator("#hud-level")).to_have_text("LV 2")


def test_dragging_moves_the_player(phone: Page):
    start_case(phone, 1)
    before = phone.evaluate("PA.game.player.x")
    phone.mouse.move(200, 500)
    phone.mouse.down()
    phone.mouse.move(320, 500, steps=5)
    phone.wait_for_timeout(600)
    phone.mouse.up()
    assert phone.evaluate("PA.game.player.x") > before + 10


def test_losing_offers_a_retry(phone: Page):
    start_case(phone, 1)
    phone.evaluate("PA.loseNow()")
    expect(phone.locator("#lost")).to_be_visible()
    phone.get_by_role("button", name="Try again").click()
    expect(phone.locator("#hud")).to_be_visible()
    assert phone.evaluate("PA.game.status") == "playing"


def test_codex_unlocks_and_explains(phone: Page):
    phone.get_by_role("button", name="📖 Codex").click()
    expect(phone.locator("#codex-list button:enabled")).to_have_count(1)
    phone.locator('[data-entry="toothbrush"]').click()
    expect(phone.locator("#codex-detail")).to_contain_text("Modified Bass")
    phone.get_by_role("tab", name="Anatomy & Charting").click()
    phone.locator('[data-entry="chart-universal"]').click()
    expect(phone.locator("#codex-detail")).to_contain_text(
        "maxillary right third molar"
    )


def test_save_code_moves_progress_to_another_device(
    browser, site, errors
):  # pylint: disable=unused-argument
    first = browser.new_context(viewport=PHONE).new_page()
    first.goto(f"{site}/?debug")
    start_case(first)
    first.evaluate("PA.winNow()")
    first.get_by_role("button", name="Continue to quiz").click()
    answer_quiz(first)
    first.get_by_role("button", name="Appointments").click()
    first.get_by_role("button", name="← Back").first.click()
    first.get_by_role("button", name="⚙️ Settings").click()
    code = first.locator("#save-code").input_value()
    assert len(code) > 40

    second = browser.new_context(viewport=PHONE).new_page()
    second.goto(f"{site}/")
    second.get_by_role("button", name="⚙️ Settings").click()
    second.locator("#load-code").fill(code)
    second.get_by_role("button", name="Load code").click()
    expect(second.locator("#save-feedback")).to_have_text("Progress loaded!")
    second.get_by_role("button", name="← Back").click()
    expect(second.locator("#title-progress")).to_contain_text("Cases 2/7")


def test_offline_files_and_install_manifest(page: Page, site):
    page.goto(f"{site}/manifest.webmanifest")
    assert '"display": "fullscreen"' in page.content()
    page.goto(f"{site}/sw.js")
    assert "js/engine.js" in page.content()

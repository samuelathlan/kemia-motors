Feature: Kemia Motors - Complete Professional Testing Suite
  As a CPO/CTO
  I want comprehensive testing of all user journeys
  So that I can ensure enterprise-grade quality

  Background:
    Given the app is running at "https://kemia-motors-production.up.railway.app"
    And test database is seeded with admin and member users
    And all migrations are applied to Supabase

  # ============================================================
  # LANDING PAGE & PUBLIC PAGES
  # ============================================================

  Scenario: Landing Page loads with proper branding
    Given I visit the landing page
    Then I should see the Kemia Motors logo
    And I should see the tagline "Ride & Share"
    And I should see "Connexion" button
    And I should see "Vous êtes invité ?" button
    And the page title should be "Kemia Motors"
    And the design should be dark theme professional

  Scenario: Landing Page CTA buttons are functional
    Given I visit the landing page
    When I click "Connexion" button
    Then I should be redirected to "/auth/login"
    And the URL should show "/auth/login"

  # ============================================================
  # AUTHENTICATION & AUTHORIZATION
  # ============================================================

  Scenario: Admin Login - Valid credentials
    Given I visit the login page
    When I enter email "admin@kemia.test"
    And I enter password "Test123!@#"
    And I click "Se connecter"
    Then I should see a loading state
    And I should be redirected to "/dashboard"
    And the page should load successfully
    And I should see the admin dashboard

  Scenario: Member Login - Valid credentials
    Given I visit the login page
    When I enter email "member@kemia.test"
    And I enter password "Test123!@#"
    And I click "Se connecter"
    Then I should be redirected to "/dashboard"
    And I should see the member dashboard

  Scenario: Login - Invalid credentials
    Given I visit the login page
    When I enter email "wrong@email.com"
    And I enter password "WrongPassword123"
    And I click "Se connecter"
    Then I should see an error message
    And I should remain on the login page

  Scenario: Login - Email validation
    Given I visit the login page
    When I enter email "invalid-email"
    And I click "Se connecter"
    Then I should see a validation error
    And the form should not submit

  Scenario: Protected routes redirect to login
    When I visit "/dashboard" without authentication
    Then I should be redirected to "/auth/login"
    When I visit "/charter" without authentication
    Then I should be redirected to "/auth/login"
    When I visit "/outings" without authentication
    Then I should be redirected to "/auth/login"
    When I visit "/map" without authentication
    Then I should be redirected to "/auth/login"
    When I visit "/motorcycles" without authentication
    Then I should be redirected to "/auth/login"
    When I visit "/admin" without authentication
    Then I should be redirected to "/auth/login"

  # ============================================================
  # ADMIN USER JOURNEY
  # ============================================================

  Scenario: Admin Dashboard - Full functionality
    Given I am logged in as admin
    When I visit "/dashboard"
    Then I should see the admin dashboard
    And I should see personal statistics
    And I should see navigation menu with all sections
    And I should see "Administration" link in menu

  Scenario: Admin Panel - Member management
    Given I am logged in as admin
    When I visit "/admin"
    Then I should see member list
    And I should see member management controls
    And I should see buttons for edit/remove
    And I should see search functionality

  Scenario: Admin - Charter management
    Given I am logged in as admin
    When I visit "/charter"
    Then I should see all charter articles
    And I should see article titles: "Esprit du Club", "Sécurité", "Respect"
    And I should see that I have accepted the charter
    And the articles should be properly formatted

  Scenario: Admin - Outings management
    Given I am logged in as admin
    When I visit "/outings"
    Then I should see the list of outings
    And I should see "Weekend Route des Alpes" in the list
    And I should see "Roadtrip Côte d'Azur" in the list
    And each outing should show date, description, and participants count
    And I should see a button to create new outing
    When I click on an outing
    Then I should see full outing details
    And I should see participants list
    And I should see RSVP status

  Scenario: Admin - Motorcycles management
    Given I am logged in as admin
    When I visit "/motorcycles"
    Then I should see my motorcycle "The Beast"
    And I should see motorcycle details: brand, model, year, mileage
    And I should see a button to add new motorcycle
    And I should see edit/delete buttons

  Scenario: Admin - Global Map view
    Given I am logged in as admin
    When I visit "/map"
    Then the map should load successfully
    And I should see places visited by all members
    And I should be able to interact with the map

  # ============================================================
  # MEMBER USER JOURNEY
  # ============================================================

  Scenario: Member Dashboard - Limited visibility
    Given I am logged in as member
    When I visit "/dashboard"
    Then I should see the member dashboard
    And I should see personal statistics
    And I should NOT see "Administration" link
    And the dashboard should be read-only for non-personal data

  Scenario: Member - Charter acceptance flow
    Given I am logged in as member
    When I visit "/charter"
    Then I should see all charter articles
    And I should see that I have already accepted the charter
    And I should not be able to modify articles

  Scenario: Member - Outings participation
    Given I am logged in as member
    When I visit "/outings"
    Then I should see list of outings
    And I should see "Weekend Route des Alpes"
    When I click on an outing
    Then I should see outing details
    And I should see participants list
    And I should see my RSVP status (should be "oui")
    And I should see other members' motorcycles (if shared)

  Scenario: Member - View own motorcycle
    Given I am logged in as member
    When I visit "/motorcycles"
    Then I should see my motorcycle "Green Machine"
    And I should see my motorcycle details
    And I should be able to edit my own motorcycle
    And I should be able to delete my own motorcycle

  Scenario: Member - Cannot access admin panel
    Given I am logged in as member
    When I try to visit "/admin"
    Then I should be redirected to "/dashboard"
    And I should see an error message or no admin option in menu

  # ============================================================
  # RESPONSIVE DESIGN & UX
  # ============================================================

  Scenario: Desktop layout - All pages responsive
    Given I am viewing the app on desktop (1920x1080)
    Then all pages should display properly
    And navigation should be visible
    And content should be readable
    And buttons should be accessible

  Scenario: Mobile layout - All pages responsive
    Given I am viewing the app on mobile (375x812)
    Then all pages should display properly
    And navigation should be accessible (hamburger menu or dropdown)
    And content should be readable
    And buttons should be easily tappable (min 44x44px)

  Scenario: Dark theme - Visual consistency
    Given I am logged in
    Then all pages should use consistent dark theme
    And text should be readable on dark background
    And buttons should have good contrast
    And accent colors should be consistent (orange #D9622B, tan #E8D5B0)

  # ============================================================
  # ERROR HANDLING & EDGE CASES
  # ============================================================

  Scenario: Network error handling
    Given the API is temporarily unavailable
    When I try to perform an action
    Then I should see a friendly error message
    And I should be given an option to retry
    And the app should not crash

  Scenario: Timeout handling
    Given a request takes longer than expected
    When I wait for the response
    Then I should see a loading indicator
    And eventually I should see either success or timeout error
    And the UI should remain responsive

  # ============================================================
  # DATABASE & DATA INTEGRITY
  # ============================================================

  Scenario: Data persistence - Admin creation
    Given I am logged in as admin
    When I create new data (outing, motorcycle, etc)
    Then the data should be saved to database
    And the data should be visible in list views
    And the data should persist on page refresh

  Scenario: RLS policies enforcement
    Given member A is logged in
    When member A visits any page
    Then member A should only see:
      - Public information (charter, others' outings)
      - Personal information (own motorcycles, own profile)
      - Active members data (other members' motorcycles in outings)
    And member A should NOT see:
      - Deleted/inactive member data
      - Admin-only information

  Scenario: Charter acceptance required
    Given a new member just created an account
    When they try to access "/dashboard"
    Then they should be redirected to "/charter"
    And they should be required to accept charter
    And only after acceptance should they access main app

  # ============================================================
  # SECURITY
  # ============================================================

  Scenario: HTTPS enforcement
    When I visit the app
    Then the connection should be HTTPS
    And security headers should be present

  Scenario: Session handling
    Given I am logged in
    When I close the browser tab
    And I reopen the app
    Then I should still be logged in (session persists)
    When I explicitly logout
    Then I should be redirected to landing page
    And I should not be able to access protected routes

  Scenario: CSRF protection
    Given I am logged in
    When I make any state-changing request (POST, PUT, DELETE)
    Then the request should include proper CSRF tokens
    And requests without valid tokens should fail

  # ============================================================
  # PERFORMANCE
  # ============================================================

  Scenario: Initial page load - Landing page
    Given I visit the landing page
    Then the page should load in less than 3 seconds
    And images should be optimized
    And CSS should be minified

  Scenario: Dashboard load - With data
    Given I am logged in
    When I visit "/dashboard"
    Then the page should load in less than 2 seconds
    And all data should be visible
    And no console errors should be present

  Scenario: List views - Data rendering
    Given I am logged in
    When I visit pages with lists (outings, motorcycles)
    Then items should render smoothly
    And pagination/lazy loading should work if implemented
    And search/filter should be responsive

  # ============================================================
  # ACCESSIBILITY
  # ============================================================

  Scenario: Keyboard navigation
    Given I am on the landing page
    When I use Tab to navigate
    Then all interactive elements should be keyboard accessible
    And focus state should be visible
    And I should be able to submit forms with Enter key

  Scenario: Screen reader compatibility
    Given I use a screen reader
    When I navigate the app
    Then all images should have alt text
    And form labels should be properly associated
    And heading hierarchy should be logical

  # ============================================================
  # INTEGRATION TESTS
  # ============================================================

  Scenario: End-to-end: Admin creates outing and member joins
    Given I am logged in as admin
    When I create a new outing "Test Sortie"
    And I set the date and location
    And I save the outing
    Then the outing should appear in the list
    When I log out and log in as member
    And I visit "/outings"
    Then I should see the new outing "Test Sortie"
    And I should be able to RSVP "oui"
    When I log out and log in as admin
    And I visit the outing details
    Then I should see the member in the participants list

  Scenario: End-to-end: Member shares motorcycle and admin sees it
    Given I am logged in as member
    When I add a new motorcycle
    And I save the motorcycle
    Then the motorcycle should appear in my list
    When I log out and log in as admin
    And I visit "/motorcycles"
    Then I should see the member's motorcycle
    And the motorcycle details should be correct

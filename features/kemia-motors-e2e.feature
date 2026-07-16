Feature: Kemia Motors - Comprehensive Platform Testing

  Scenario: Landing Page Loads Successfully
    Given I visit the Kemia Motors landing page
    Then I should see the Kemia Motors logo
    And I should see "Connexion" button
    And I should see "Vous êtes invité ?" button

  Scenario: Login Page Accessibility
    Given I visit the login page
    Then I should see the login form
    And I should see email input field
    And I should see password input field

  Scenario: Signup Page Requires Valid Invite Code
    Given I visit the signup page without invite code
    Then I should see "Lien d'invitation invalide ou expiré"
    And I should be redirected to login page

  Scenario: Charter Page Protected (Member Only)
    Given I visit the charter page without authentication
    Then I should be redirected to login page

  Scenario: Dashboard Protected (Member Only)
    Given I visit the dashboard without authentication
    Then I should be redirected to login page

  Scenario: Outings Page Protected (Active Member Only)
    Given I visit the outings page without authentication
    Then I should be redirected to login page

  Scenario: Motorcycles Page Protected (Active Member Only)
    Given I visit the motorcycles page without authentication
    Then I should be redirected to login page

  Scenario: Map Page Protected (Active Member Only)
    Given I visit the map page without authentication
    Then I should be redirected to login page

  Scenario: Emergency Info Page Protected (Active Member Only)
    Given I visit the emergency info page without authentication
    Then I should be redirected to login page

  Scenario: Admin Panel Protected (Admin Only)
    Given I visit the admin panel without authentication
    Then I should be redirected to login page

  Scenario: Middleware Enforces Authentication Correctly
    Given I have valid login credentials
    When I login successfully
    Then I should be able to access protected routes
    And I should NOT be able to access /auth/login
    And I should NOT be able to access /auth/signup

  Scenario: Supabase Database Connection Active
    Given the app is running
    Then database migrations should be applied
    And RLS policies should be enforced
    And members table should exist
    And charter table should exist

  Scenario: Environment Variables Configured
    Given the app is deployed to Railway
    Then NEXT_PUBLIC_SUPABASE_URL should be set
    And NEXT_PUBLIC_SUPABASE_ANON_KEY should be set
    And SUPABASE_SERVICE_ROLE_KEY should be set

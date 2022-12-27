# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i

To register a username - must include { username, password, firstName, lastName, email }

    POST-> /auth/register

To login to a username - must include { username, password }

    POST-> /auth/token

Token may be placed in headers of your request as authorization : token

To get list of companies. Optional filters can be included in query string . Filters include name, minEmployees & maxEmployees.
    GET -> /companies/
    (optional filters) GET-> /companies?name=name

To get a single company:

    GET-> /companies/:handle

To create a new company (requires admin) - must include { handle, name, description, numEmployees, logoUrl }:

    POST-> /companies/

To update a company (requires admin) - update fields can be { name, description, numEmployees, logo_url }:

    PATCH-> /companies/:handle

To delete a company (requires admin) 

    DELETE-> /companies/:handle

To get a list of users -> requires admin

    GET-> /users/

To get a user by username -> requires admin, or that logged in user

    GET-> /users/:username

To create a new user. This route is just for admins to be able to create a new user. Requires { username, firstName, lastName, email, isAdmin }. This will return the created user, along with a Token for that user.

    POST-> /users/

To apply for a listed job with id -> limited to that user OR admin

    POST-> /users/:username/jobs/:id

To update a user. Data can include { firstName, lastName, password, or email} -> limited to that user OR admin

    PATCH-> /users/:username

To delete a user. Authorization requires admin OR that logged in user

    DELETE-> /users/:username

To get all posted jobs - optional filters include title, minSalary, hasEquity

    GET -> /jobs
    GET -> /jobs?title=title

To create a job, requires admin. Job needs { title, salary, equity, company_handle }

    POST -> /jobs

To update a job, requires admin. Fields can be {title, salary, equity}

    PATCH -> /jobs/:id

To delete a job. Requires admin.

    DELETE -> /jobs/:id





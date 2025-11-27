# Todo Django App (01-overview)

This is a minimal Django TODO application used for homework. It supports:

- Create, edit and delete TODOs
- Assign due dates
- Mark TODOs as resolved

Quick start (Linux / bash):

```bash
# create a virtualenv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# initialize DB and run migrations
python manage.py migrate

# create a superuser (optional, for admin)
python manage.py createsuperuser

# run with Django dev server
python manage.py runserver

# or run with uvicorn (ASGI) if you installed uvicorn:
# uvicorn todo_project.asgi:application --reload
```

Project files are under `01-overview/`.

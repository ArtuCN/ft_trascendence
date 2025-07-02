
FROM python:3.9

WORKDIR /code

COPY requirement.txt /code/requirement.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirement.txt

CMD ["uvicorn", "botAI:app", "--host", "0.0.0.0", "--port", "8001"]
FROM python:3.9

WORKDIR /code

COPY requirement.txt /code/requirement.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirement.txt

CMD ["sh", "-c", "uvicorn botAI:app --host 0.0.0.0 --port $AI_PORT"]

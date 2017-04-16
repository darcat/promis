FROM weihan/webdriver-python

RUN mkdir -p /usr/src/test
WORKDIR /usr/src/test
COPY requirements.txt /usr/src/test/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /usr/src/test

CMD [ "/usr/src/test/start_ftp.sh" ]

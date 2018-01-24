#!/bin/bash

echo 'gen report start...'

url="http://localhost:4001/report?pretty"
echo "url: $url"
curl $url
echo

echo "done."

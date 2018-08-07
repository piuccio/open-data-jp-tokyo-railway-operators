## List of Railway operators in Tokyo

The list is extracted from the [Association for Open Data of Public Transportation](http://www.odpt.org/) using the query https://api-tokyochallenge.odpt.org/api/v4/odpt:Railway

Additional information is from this Wikipedia page https://en.wikipedia.org/wiki/List_of_railway_companies_in_Japan

The list only contains operators and railways that operate inside Tokyo-to, this also includes railways from neighbouring prefectures

### Usage

Just grab the file `operators.json` it has a list of objects with the structure

```json
{
  "code": "TWR",
  "name_kanji": "東京臨海高速鉄道 (りんかい線) (TWR)",
  "name_romaji": "Tōkyō Waterfront Area Rapid Transit",
  "railways": [
    {
      "code": "TWR.Rinkai",
      "name_kanji": "りんかい線",
      "name_romaji": "Rinkai Line"
    }
  ]
}
```

Each operator includes a list of available railways.

## Related links

More [open data repositories](https://github.com/piuccio?utf8=%E2%9C%93&tab=repositories&q=open-data-jp&type=&language=).

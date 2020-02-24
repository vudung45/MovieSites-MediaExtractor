# Pirated-MovieSites-MediaExtractor

Supports extracting Media Sources (direct video source with no ads) from various pirated movie sites such as (Bilutv, KhoaiTV, etc.). Caching system is implemented to avoid IP bans, so the code is basically production ready.
```bash
npm install
npm run start
```

# Implementation Summary

1. Implement media source extracting schema for each sites. (source: `site/*.js`)
2. Caching system:
    + `cache/*.js` contains multiple implementations of CacheManager extending from `cache/base.js`. 
    + CacheManager is utilized in retrieving metadata from `streaming_services` (Hydrax, Google Drive, Google Photos, Youtube, ...) and pirated sites metadata (Phimmoi's API, Bilutv's API)
    + Muti-layer cache:
        + Since we need to retrieve site's metadata (through SiteAPI) before getting the necessary information to call Streaming Service's API, a multi-layer cache is implemented to handle cases when one of them goes down, or both go down. (IP bans)

# Live Demo
http://mediaextractor.herokuapp.com/api/getmedia?url=[Link]

Ex: http://mediaextractor.herokuapp.com/api/getmedia?url=%2Fapi%2Fgetmedia%3Furl%3Dhttps%3A%2F%2Fbilutv.org%2Fphim-tam-sinh-tam-the-cham-thuong-thu-tap-1-12627.148999.html&fbclid=IwAR0LWQWxY50d9VOXCfWY3Tbk4kbLeCdoxMHYPakN0a3izNbQMOjkN98Di5s

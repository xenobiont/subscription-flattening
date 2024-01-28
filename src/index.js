import { asyncScheduler, of, scheduled, takeUntil, delay } from "rxjs";

// Mocks

const userInfoService = {
  userPermissions$: scheduled(
    of({
      preLogin: false,
      articles: true,
    }),
    asyncScheduler
  ),
};

const PageViewCategory = {
  dashboard: "dashboard",
};

const trackerService = {
  recordPageView(target) {
    console.log(`do something with ${target}`);
  },
};

const dashboardService = {
  getParams$() {
    return scheduled(
      of({
        entityId: 1,
      }),
      asyncScheduler
    );
  },

  setCurrentEntity(entity) {
    console.log(`setting the entity ${entity}`);
  },
};

const apiService = {
  getArticleStats$(id) {
    return scheduled(
      of({
        entity: {
          name: "fake article entity",
          instrumentId: 1,
        },
      }),
      asyncScheduler
    );
  },
};

const ngUnsubscribe$ = scheduled(of({}), asyncScheduler).pipe(delay(3000));

function loadInstrumentData(id) {
  console.log("result: " + id); // should print result: 1
  //
}

let currentEntity;
let isLimited;

// fix this code!

userInfoService.userPermissions$.subscribe((permissions) => {
  isLimited = permissions.preLogin;

  if (!isLimited) {
    trackerService.recordPageView(PageViewCategory.dashboard);

    dashboardService
      .getParams$()
      .pipe(takeUntil(ngUnsubscribe$))
      .subscribe((params) => {
        const id = params.entityId;
        console.log(params);
        if (id) {
          apiService.getArticleStats$(id).subscribe((article) => {
            if (article !== null && permissions.articles) {
              currentEntity = article.entity;
              // Set current entity for dashboard page
              dashboardService.setCurrentEntity(article.entity);

              if (currentEntity.instrumentId) {
                loadInstrumentData(currentEntity.instrumentId);
              }
            }
          });
        }
      });
  }
});

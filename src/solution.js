import {
	asyncScheduler,
	of,
	scheduled,
	takeUntil,
	delay,
	tap,
	filter,
	switchMap,
	map,
	withLatestFrom,
} from 'rxjs';

/*
The code that we’ll be looking at here today originates from a real application that collects news articles, social media posts,
and individual blogs published online about stocks and other investment instruments.
The application then provides analytics that enables investors to gain a reliable view of the crowd‘s impact on their holdings.

The code in question fetches the data for the dashboard screen */

// Mocks

const userInfoService = {
	userPermissions$: scheduled(
		of({
			preLogin: false,
			articles: true,
		}),
		asyncScheduler,
	),
};

const PageViewCategory = {
	dashboard: 'dashboard',
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
			asyncScheduler,
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
					name: 'fake article entity',
					instrumentId: 1,
				},
			}),
			asyncScheduler,
		);
	},
};

const ngUnsubscribe$ = scheduled(of({}), asyncScheduler).pipe(delay(3000));

function loadInstrumentData(id) {
	console.log('result: ' + id); // should print result: 1
	//
}

let currentEntity;
let isLimited;

// fix this code!

userInfoService.userPermissions$
	.pipe(
		tap((permissions) => {
			isLimited = permissions.preLogin;
		}),
		filter(() => !isLimited),
		// we need this if we suppose that this global state is used somewhere else; otherwise we can do filter(permissions => Boolean(permissions.preLogin)) instead of 2 operators above
		tap(() => {
			trackerService.recordPageView(PageViewCategory.dashboard);
		}),
		switchMap(() => dashboardService.getParams$()),
		map((params) => params.entityId),
		filter((id) => Boolean(id)),
		switchMap((id) => apiService.getArticleStats$(id)),
		withLatestFrom(userInfoService.userPermissions$),
		takeUntil(ngUnsubscribe$),
	)
	.subscribe(([article, permissions]) => {
		if (article !== null && permissions.articles) {
			currentEntity = article.entity;
			// Set current entity for dashboard page
			dashboardService.setCurrentEntity(article.entity);
			if (currentEntity.instrumentId) {
				loadInstrumentData(currentEntity.instrumentId);
			}
		}
	});

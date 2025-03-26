import React, { lazy, Suspense, useContext, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loading from './components/Loading';
import User from './pages/User';
import { PrivateRoute } from './components/PrivateRoute';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import NotFound from './pages/NotFound';
import Setting from './pages/Setting';
import EditUser from './pages/User/EditUser';
import PasswordResetForm from './components/PasswordResetForm';
import PasswordResetConfirm from './components/PasswordResetConfirm';
import Channel from './pages/Channel';
import Token from './pages/Token';
import EditChannel from './pages/Channel/EditChannel';
import Redemption from './pages/Redemption';
import TopUp from './pages/TopUp';
import Log from './pages/Log';
import Chat from './pages/Chat';
import Chat2Link from './pages/Chat2Link';
import { Layout } from '@douyinfe/semi-ui';
import Midjourney from './pages/Midjourney';
import Pricing from './pages/Pricing/index.js';
import Task from "./pages/Task/index.js";
import Playground from './pages/Playground/Playground.js';
import OAuth2Callback from "./components/OAuth2Callback.js";
import PersonalSetting from './components/PersonalSetting.js';
import Tenant from './pages/Tenant/index.js';
import Console from './pages/Console/index.js';
import SystemAdmin from './pages/SystemAdmin/index.js';

const Home = lazy(() => import('./pages/Home'));
const Detail = lazy(() => import('./pages/Detail'));
const About = lazy(() => import('./pages/About'));

function App() {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route
          path='/'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Home />
            </Suspense>
          }
        />
        {/* pfee 添加控制器父路由 */}
        <Route
          path='/console'
          element={
            <Console />
          }
        >
          <Route
            path='/console/channel'
            element={
              <PrivateRoute>
                <Channel />
              </PrivateRoute>
            }
          />
          <Route
            path='/console/channel/edit/:id'
            element={
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <EditChannel />
              </Suspense>
            }
          />
          <Route
            path='/console/channel/add'
            element={
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <EditChannel />
              </Suspense>
            }
          />
          <Route
            path='/console/token'
            element={
              <PrivateRoute>
                <Token />
              </PrivateRoute>
            }
          />
          <Route
            path='/console/playground'
            element={
              <PrivateRoute>
                <Playground />
              </PrivateRoute>
            }
          />
          <Route
            path='/console/redemption'
            element={
              <PrivateRoute>
                <Redemption />
              </PrivateRoute>
            }
          />
          <Route
            path='/console/oauth/github'
            element={
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <OAuth2Callback type='github'></OAuth2Callback>
              </Suspense>
            }
          />
          <Route
            path='/console/oauth/oidc'
            element={
              <Suspense fallback={<Loading></Loading>}>
                <OAuth2Callback type='oidc'></OAuth2Callback>
              </Suspense>
            }
          />
          <Route
            path='/console/oauth/linuxdo'
            element={
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <OAuth2Callback type='linuxdo'></OAuth2Callback>
              </Suspense>
            }
          />
          <Route
            path='/console/setting'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <Setting />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path='/console/personal'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <PersonalSetting />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path='/console/topup'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <TopUp />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path='/console/log'
            element={
              <PrivateRoute>
                <Log />
              </PrivateRoute>
            }
          />
          <Route
            path='/console/detail'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <Detail />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path='/console/midjourney'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <Midjourney />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path='/console/task'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <Task />
                </Suspense>
              </PrivateRoute>
            }
          />
        </Route>
        {/* pfee 添加控制器父路由 */}

        <Route
          path='/login'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <LoginForm />
            </Suspense>
          }
        />
        <Route
          path='/register'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <RegisterForm />
            </Suspense>
          }
        />
        <Route
          path='/reset'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <PasswordResetForm />
            </Suspense>
          }
        />

        <Route
          path='/pricing'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Pricing />
            </Suspense>
          }
        />
        <Route
          path='/about'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <About />
            </Suspense>
          }
        />
        <Route
          path='/chat/:id?'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Chat />
            </Suspense>
          }
        />
        {/* 方便使用chat2link直接跳转聊天... */}
        <Route
          path='/chat2link'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Chat2Link />
              </Suspense>
            </PrivateRoute>
          }
        />
        {/* pfee 添加系统管理 */}
        <Route path='/system-admin' element={<SystemAdmin />} >
          {/* 原用户管理迁移至系统管理 */}
          <Route
            path='/system-admin/user'
            element={
              <PrivateRoute>
                <User />
              </PrivateRoute>
            }
          />
          <Route
            path='/system-admin/user/edit/:id'
            element={
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <EditUser />
              </Suspense>
            }
          />
          <Route
            path='/system-admin/user/edit'
            element={
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <EditUser />
              </Suspense>
            }
          />
          <Route
            path='/system-admin/user/reset'
            element={
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <PasswordResetConfirm />
              </Suspense>
            }
          />
          {/* pfee 添加组织管理路由 */}
          <Route
            path='/system-admin/company'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <Tenant />
                </Suspense>
              </PrivateRoute>
            }
          />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;

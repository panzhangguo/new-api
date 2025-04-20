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
import PasswordResetForm from './components/acfx/PasswordResetForm.js';
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
import Task from './pages/Task/index.js';
import Playground from './pages/Playground/Playground.js';
import OAuth2Callback from './components/OAuth2Callback.js';
import PersonalSetting from './components/PersonalSetting.js';
import Setup from './pages/Setup/index.js';
import SetupCheck from './components/SetupCheck';
/**pfee */
import AcfxOperationBackground from './pages/AcfxOperationBackground/index.js';
import WinloadTeamManage from './pages/WinloadTeamManage/index.js';
import WinloadAccount from './pages/WinloadAccount/index.js';
import WinloadMyTeam from './pages/WinloadMyTeam/index.js';
import AcfxAddTeam from './components/winload/AddTeam.js';
import WinloadMyTeamApi from './pages/WinloadMyTeamApi/index.js';
/**pfee */
const Home = lazy(() => import('./pages/Home'));
const Detail = lazy(() => import('./pages/Detail'));
const About = lazy(() => import('./pages/About'));

function App() {
  const location = useLocation();

  return (
    <SetupCheck>
      <Routes>
        <Route
          path='/'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path='/channel'
          element={
            <PrivateRoute>
              <Channel />
            </PrivateRoute>
          }
        />
        <Route
          path='/channel/edit/:id'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <EditChannel />
            </Suspense>
          }
        />
        <Route
          path='/channel/add'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <EditChannel />
            </Suspense>
          }
        />
        <Route
          path='/token'
          element={
            <PrivateRoute>
              <Token />
            </PrivateRoute>
          }
        />
        <Route
          path='/playground'
          element={
            <PrivateRoute>
              <Playground />
            </PrivateRoute>
          }
        />
        <Route
          path='/redemption'
          element={
            <PrivateRoute>
              <Redemption />
            </PrivateRoute>
          }
        />
        <Route
          path='/oauth/github'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <OAuth2Callback type='github'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/oauth/oidc'
          element={
            <Suspense fallback={<Loading></Loading>}>
              <OAuth2Callback type='oidc'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/oauth/linuxdo'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <OAuth2Callback type='linuxdo'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/setting'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Setting />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/personal'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <PersonalSetting />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/log'
          element={
            <PrivateRoute>
              <Log />
            </PrivateRoute>
          }
        />
        <Route
          path='/detail'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Detail />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/midjourney'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Midjourney />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/task'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Task />
              </Suspense>
            </PrivateRoute>
          }
        />
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
        <Route
          path='/setup'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Setup />
            </Suspense>
          }
        />
        {/* pfee 添加系统管理 */}
        <Route path='/operation-background' element={<AcfxOperationBackground />} >
          {/* 原用户管理迁移至系统管理 */}
          <Route
            path='/operation-background/user'
            element={
              <PrivateRoute>
                <User />
              </PrivateRoute>
            }
          />
          <Route
            path='/operation-background/user/edit/:id'
            element={
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <EditUser />
              </Suspense>
            }
          />
          <Route
            path='/operation-background/user/edit'
            element={
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <EditUser />
              </Suspense>
            }
          />
          <Route
            path='/operation-background/user/reset'
            element={
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <PasswordResetConfirm />
              </Suspense>
            }
          />
          {/* pfee 添加团队管理路由 */}
          <Route
            path='/operation-background/teammanage'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <WinloadTeamManage />
                </Suspense>
              </PrivateRoute>
            }
          />
        </Route>
        {/* pfee 添加账号管理路由 个人信息由控制台迁移到个账号人中心 */}
        <Route path='/account' element={<WinloadAccount />} >
          <Route
            path='/account/personal'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <PersonalSetting />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path='/account/topup'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <TopUp />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path='/account/my-team'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <WinloadMyTeam />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path='/account/create-team'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <AcfxAddTeam />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path='/account/my-team-api'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                  <WinloadMyTeamApi />
                </Suspense>
              </PrivateRoute>
            }
          />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </SetupCheck>
  );
}

export default App;
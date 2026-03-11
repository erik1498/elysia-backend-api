import Elysia, { t } from "elysia";
import { BaseResponseSchema } from "../../schemas/response.schema";
import { UserInfoResponseSchema, UserLoginBodySchema, UserLoginResponseSchema, UserRegisterBodySchema } from "./user.schema";
import { jwtMiddleware } from "../../middlewares/jwt.middleware";
import { userHandler } from "./user.handler";
import { rateLimiter } from "../../middlewares/rate-limit.middleware";

export const userRoute = (app: Elysia) => {
    return app
        .group("/user", group =>
            group
                .group("", loginGroup =>
                    loginGroup
                        .use(rateLimiter("/auth", 3, 900))
                        .post("/login", userHandler.loginHandler, {
                            body: UserLoginBodySchema,
                            detail: {
                                tags: ["User"],
                                summary: "User Login"
                            },
                            response: {
                                200: BaseResponseSchema(UserLoginResponseSchema)
                            }
                        })
                )
                .group("", refreshTokenGroup =>
                    refreshTokenGroup
                        .use(rateLimiter("/refresh", 12, 900))
                        .get("/refresh", userHandler.refreshUserHandler, {
                            detail: {
                                tags: ["User"],
                                summary: "User Refresh"
                            },
                            response: {
                                200: BaseResponseSchema(UserLoginResponseSchema)
                            }
                        })
                )
                .group("", group =>
                    group
                        .use(jwtMiddleware)
                        .post("/register", userHandler.registerHandler, {
                            roles: ["super_admin"],
                            body: UserRegisterBodySchema,
                            detail: {
                                tags: ["User"],
                                summary: "User Register"
                            },
                            response: {
                                201: BaseResponseSchema(t.Any())
                            }
                        })
                        .get("/user_info", userHandler.getUserInfoHandler, {
                            detail: {
                                tags: ["User"],
                                summary: "User Information"
                            },
                            response: {
                                200: BaseResponseSchema(UserInfoResponseSchema)
                            }
                        })
                        .delete("/logout", userHandler.logoutHandler, {
                            detail: {
                                tags: ["User"],
                                summary: "User Logout"
                            }
                        })
                )
        )
}
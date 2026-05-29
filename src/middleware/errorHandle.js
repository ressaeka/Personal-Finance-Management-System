import { errorResponse } from "../utils/response.js"

export const errorHandle = (err, req, res, next) => {
    const isProduction = process.env.NODE_ENV === "production";

    if(!isProduction){
        console.error("ERROR", err)
    }
    else{
        console.error(`ERROR, [${err.status || 500}]:  ${err.message}`)
    }

    if(err.name === "TokenExpiredError"){
        return errorResponse(res, "Token sudah expired", 401)
    }

    if(err.name === "JsonWebTokenError"){
        return errorResponse(res, "Token tidak valid", 401)
    }

    const statusCode = err.statusCode || 400;
    if(err.message){
        return errorResponse(res, err.message, statusCode)
    }

    const message = isProduction ? "Terjadi kesalahan server" : err.message;
    return errorResponse(res, message, statusCode)
};
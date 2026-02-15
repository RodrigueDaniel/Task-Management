export const errorHandler = (err, req, res, next) => {
    console.error(err);

    if(err.code === "P2002") {
        return res.status(409).json({ message: "Duplicate record" });
    }

    if(err.code === "P2025") {
        return res.status(404).json({ message: "Record not found" });
    }

    return res.status(500).json({ message: "Internal Server Error"})
}
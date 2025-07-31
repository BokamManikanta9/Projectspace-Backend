const express = require("express");
const route = express.Router();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

route.post("/create-incident", async (req, res) => {
  const { user_name, user_mail, job_discription } = req.body;

  const url = "https://dev276166.service-now.com/api/now/table/x_1756569_skillsan_master_table";
  const username = "admin";
  const password = "E4@qwmQgL7-X"; // Replace with your instance password
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        user_name,
        user_mail,
        job_discription,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({
        message: "Record created successfully",
        sys_id: data.result.sys_id,
      });
    } else {
      return res.status(response.status).json({
        message: "Failed to create record",
        error: data,
      });
    }
  } catch (error) {
    console.error("ServiceNow error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = route;

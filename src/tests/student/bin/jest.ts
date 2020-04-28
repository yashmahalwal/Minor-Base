import childProcess from "child_process";
import chalk from "chalk";

console.log(chalk.whiteBright.underline(`Action: Running JEST`));
childProcess.execSync("npm run start", { stdio: "inherit" });
console.log("\n\n");

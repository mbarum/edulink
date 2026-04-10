"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExaminationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_examination_dto_1 = require("./create-examination.dto");
class UpdateExaminationDto extends (0, mapped_types_1.PartialType)(create_examination_dto_1.CreateExaminationDto) {
}
exports.UpdateExaminationDto = UpdateExaminationDto;
//# sourceMappingURL=update-examination.dto.js.map
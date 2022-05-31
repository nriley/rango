export interface RequestFromTalon {
	version?: number;
	type: "request";
	action: Command;
}

export interface ResponseToTalon {
	type: "response";
	action: Command;
}

export interface Command {
	type: string;
	target?: string;
	textToCopy?: string;
	textCopied?: string;
	amount?: number;
	hints?: string[];
}

export interface Message {
	version?: number;
	type: "request" | "response";
	action: Command;
}

export interface Intersector {
	element: Element;
	hintElement?: Element;
	hintText?: string;
	isVisible: boolean;
	clickableType: string | undefined;
}

export interface Rgba {
	r: number;
	g: number;
	b: number;
	a: number;
}

export type HintsStack = {
	free: string[];
	assigned: Map<string, number>;
};

export type StorableHintsStack = {
	free: string[];
	assigned: Array<[string, number]>;
};
